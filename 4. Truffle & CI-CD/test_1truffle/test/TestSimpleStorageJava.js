const SimpleStorage = artifacts.require("./SimpleStorage.sol");

contract("SimpleStorage", accounts => {
  it("...should store the value 89.", async () => {
    const simpleStorageInstance = await SimpleStorage.deployed();

    // Set value of 89
    await simpleStorageInstance.setNumber(89, { from: accounts[0] });

    // Get stored value
    const storedData = await simpleStorageInstance.getNumber.call();

    assert.equal(storedData, 89, "The value 89 was not stored.");
  });
});
