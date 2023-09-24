Make sure you have Mocha and Axios installed in your project:-

1.`npm install mocha axios chai`

How to run the tests -

`mocha 'apiTests.js' --timeout 100000`

bugs report -
1. should not create a pair without value. (in skip)
2. The excepted key store quota is 10, but we can put 11 pairs. (not in skip)
3. Should not delete a nonexistent key. (not in skip)
4. should not delete from an empty list. (not in skip)