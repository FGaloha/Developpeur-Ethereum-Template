const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("SimpleStorage", accounts => {
  it("...should store the value 89.", async () => {
    const simpleStorageInstance = await SimpleStorage.deployed();

    // Set value of 89
    const myTx = await simpleStorageInstance.setNumber(89, { from: accounts[0] });

    // Get stored value
    const storedData = await simpleStorageInstance.getNumber.call();

    // assert.equal(storedData, 89, "The value 89 was not stored.");

    // 3 functions of the OZ test helpers package
    // following expect let us check the value 89 and at the same time it is a uint 256
    expect(storedData).to.be.bignumber.equal(new BN(89));

    // expectRevert is to check that if we overpass contract rules / expected behavior it triggers a revert
    // await expectRevert(simpleStorageInstance.setNumber(0, { from: accounts[0] }), "Revert successfully triggered");

    //expectEvent(myTx, "nameEvent", { _param1: value1, _param2: _value2 });
    console.log("Salut, ceci est un log: " + storedData);

  });

});
