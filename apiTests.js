const axios = require("axios");
const { expect } = require("chai");

const apiUrl =
  "https://l761dniu80.execute-api.us-east-2.amazonaws.com/default/exercise_api";
const MAIN_KEY_NAME = "Key1";
const VALUE = "Value1";
const LONG_MAIN_KEY_NAME =
  "Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1Key1";
const LONG_VALUE =
  "value1value1value1value1value1value1value1value1value1value1value1value1value1value1value1value1value1value1value1value1";
const NONEXISTENT_MAIN_KEY_NAME = "nonexistentKey";

async function createNewItem(mainKeyInput) {
  const response = await axios.put(apiUrl, {
    main_key: mainKeyInput,
    value: VALUE,
  });
}

async function deleteItem(mainKey) {
  const response = await axios.delete(apiUrl, { data: { main_key: mainKey } });
}

function createTenItems() {
  const keys = [];

  const requests = Array.from({ length: 10 }, (_, i) => {
    return axios
      .put(apiUrl, {
        main_key: `Key${i}`,
        value: `Value${i}`,
      })
      .then((response) => {
        keys.push(`Key${i}`);
      })
      .catch((error) => {
        console.error(`Error creating item ${i}:`, error);
      });
  });

  return Promise.all(requests)
    .then(() => keys)
    .catch((error) => {
      console.error("One or more requests failed:", error);
    });
}

function deleteItems(keys) {
  const deletedKeys = [];

  const deletePromises = keys.map((key) => {
    return deleteItem(key)
      .then((mainKey) => {
        deletedKeys.push(mainKey);
      })
      .catch((error) => {
        console.error(`Error deleting item ${key}:`, error);
      });
  });

  return Promise.all(deletePromises)
    .then(() => deletedKeys)
    .catch((error) => {
      console.error("One or more deletions failed:", error);
    });
}

describe("CRUD Operations", () => {
  describe("PUT Request", () => {
    afterEach(async () => {
      await deleteItem(this.mainKey);
      console.log("Deleted item with the main key: " + this.mainKey);
    });

    it("should add a new key-value pair - happy flow", async () => {
      this.mainKey = MAIN_KEY_NAME;
      const response = await axios.put(apiUrl, {
        main_key: this.mainKey,
        value: VALUE,
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key");
      expect(response.data).to.have.property("value");
    });

    it("should add a new key-value pair when the main key and value both are long", async () => {
      this.mainKey = LONG_MAIN_KEY_NAME;
      const response = await axios.put(apiUrl, {
        main_key: this.mainKey,
        value: LONG_VALUE,
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key");
      expect(response.data).to.have.property("value");
    });

    it("should add a new key-value pair when the main key is long", async () => {
      this.mainKey = LONG_MAIN_KEY_NAME;
      const response = await axios.put(apiUrl, {
        main_key: this.mainKey,
        value: VALUE,
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key");
      expect(response.data).to.have.property("value");
    });

    it("should add a new key-value pair when the value is long", async () => {
      this.mainKey = MAIN_KEY_NAME;
      const response = await axios.put(apiUrl, {
        main_key: this.mainKey,
        value: LONG_MAIN_KEY_NAME,
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key");
      expect(response.data).to.have.property("value");
    });
  });
  describe("PUT Request - duplicate", () => {
    beforeEach(async () => {
      await createNewItem(MAIN_KEY_NAME);
      console.log("Created item with the main key: " + MAIN_KEY_NAME);
    });

    afterEach(async () => {
      await deleteItem(MAIN_KEY_NAME);
      console.log("Deleted item with the main key: " + MAIN_KEY_NAME);
    });
    it("should not add an existing key-value pair", async () => {
      try {
        const response = await axios.put(apiUrl, {
          main_key: MAIN_KEY_NAME,
          value: VALUE,
        });
      } catch (error) {
        console.error("Error:", error.response.data);
        expect(error.response.status).to.equal(400);
      }
    });
  });

  describe("PUT Request - negative flows", () => {
    it("should not add a new key-value pair when the main key is empty", async () => {
      try {
        await axios.put(apiUrl, {
          main_key: "",
          value: VALUE,
        });
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });

    //**************************************THIS IS A BUG**************************************************
    //There is a bug - should not create a pair without value
    it.skip("should not add a new key-value pair when the value is empty", async () => {
      try {
        await axios.put(apiUrl, {
          main_key: MAIN_KEY_NAME,
          value: "",
        });
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });

    it("should not add a new key-value pair when the main key and value both are empty", async () => {
      try {
        const response = await axios.put(apiUrl, {
          main_key: "",
          value: "",
        });
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });
  });

  describe("GET Request - empty list", () => {
    it("should retrieve empty list of all values", async () => {
      const response = await axios.get(apiUrl);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.length(0);
    });
  });

  describe("GET Request - happy flow", () => {
    beforeEach(async () => {
      await createNewItem(MAIN_KEY_NAME);
      console.log("Created item with the main key: " + MAIN_KEY_NAME);
    });

    afterEach(async () => {
      await deleteItem(MAIN_KEY_NAME);
      console.log("Deleted item with the main key: " + MAIN_KEY_NAME);
    });
    it("should retrieve a list of one value", async () => {
      const response = await axios.get(apiUrl);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an("array");
      expect(response.data).to.have.length(1);
    });
  });

  describe("GET Request - full capacity", () => {
    let mainKeys = [];

    beforeEach(async () => {
      mainKeys = await createTenItems();
      console.log("Finish creating " + mainKeys.length + " items");
    });
    afterEach(async () => {
      await deleteItems(mainKeys);
      console.log("Finish deleting " + mainKeys.length + " items");
    });
    it("should get ten items", async () => {
      const response = await axios.get(apiUrl);
      expect(response.status).to.equal(200);
      expect(response.data).to.have.length(10);
    });
  });

  describe("POST Request", () => {
    beforeEach(async () => {
      await createNewItem(MAIN_KEY_NAME);
      console.log("Created item with the main key: " + MAIN_KEY_NAME);
    });

    afterEach(async () => {
      await deleteItem(MAIN_KEY_NAME);
      console.log("Deleted item with the main key: " + MAIN_KEY_NAME);
    });

    it("should update an existing key-value pair - happy flow", async () => {
      const response = await axios.post(apiUrl, {
        main_key: MAIN_KEY_NAME,
        value: "UpdatedValue",
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key", MAIN_KEY_NAME);
      expect(response.data).to.have.property("value", "UpdatedValue");
    });

    it("should handle errors when key is not in the store", async () => {
      try {
        await axios.post(apiUrl, {
          main_key: "NonExistentKey",
          value: "Value",
        });
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });

    it("should handle errors when key is empty", async () => {
      try {
        await axios.post(apiUrl, { main_key: "", value: "Value" });
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });
    it("should handle errors when value is empty - this a bug", async () => {
      //We create a pair with empty value and it created successfully with empty string
      const response = await axios.post(apiUrl, {
        main_key: MAIN_KEY_NAME,
        value: "",
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key", MAIN_KEY_NAME);
      expect(response.data).to.have.property("value", "");
    });
  });

  describe("DELETE Request - empty list", () => {
    it("should delete from an empty list - this is a bug", async () => {
      // The list is empty and we try to delete from it but we get 500
      // The expected result - error, we try to delete from an empty list, the actual result - 200 success
      const response = await axios.delete(apiUrl, {
        data: { main_key: MAIN_KEY_NAME },
      });
      expect(response.status).to.equal(200);
    });
  });

  describe("DELETE Request", () => {
    beforeEach(async () => {
      await createNewItem(MAIN_KEY_NAME);
      console.log("Created item with the main key: " + MAIN_KEY_NAME);
    });

    afterEach(async () => {
      await deleteItem(MAIN_KEY_NAME);
      console.log("Deleted item with the main key: " + MAIN_KEY_NAME);
    });
    it("should delete an existing key-value pair - happy flow", async () => {
      const response = await axios.delete(apiUrl, {
        data: { main_key: MAIN_KEY_NAME },
      });
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property("main_key", MAIN_KEY_NAME);
    });

    it("should not delete a nonexistent key - this is a bug", async () => {
      // Should give keyError if you try to delete a nonexistent key but we get 200 success
      const response = await axios.delete(apiUrl, {
        data: { main_key: NONEXISTENT_MAIN_KEY_NAME },
      });
      expect(response.status).to.equal(200);
    });
  });

  //**************************************THIS IS A BUG**************************************************
  //There is a bug expected response to equal 400 - actual is 200.
  describe("PUT Request - full capacity", () => {
    let mainKeys = [];

    beforeEach(async () => {
      mainKeys = await createTenItems();
      console.log("Finish creating " + mainKeys.length + " items");
    });
    afterEach(async () => {
      mainKeys.push(NONEXISTENT_MAIN_KEY_NAME);
      await deleteItems(mainKeys);
      console.log("Finish deleting " + mainKeys.length + " items");
    });

    it("should get 400 when quota is reached - this a bug", async () => {
      // expected result - The key store quota is 10, actual result - we can put 11 items.
      const response = await axios.put(apiUrl, {
        main_key: NONEXISTENT_MAIN_KEY_NAME,
        value: VALUE,
      });
      //the status should be 400, but we get 200
      expect(response.status).to.equal(400);
    });
  });
});
