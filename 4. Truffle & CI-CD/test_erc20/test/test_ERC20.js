const FlavERC20 = artifacts.require("./FlavERC20.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("FlavERC20", accounts => {

  const _name = "FlavCoin";
  const _symbol = "FLAV";
  const _initialSupply = new BN(10000);
  const _decimals = new BN(18);
  const _owner = accounts[0];
  const _recipient = accounts[1];
  // ganache -m "victory swift tennis cabin brain cash horror smoke bracket wet bleak reject"
  // 0x8921B3238C306DF326c8d7cD67F2202d4b34dc0A;

  let flavERC20Instance;
  let _amount = new BN(100);

  beforeEach(async function () {
    flavERC20Instance = await FlavERC20.new(_initialSupply, { from: _owner });
  });

  // it("...should have a name"), async () => {
  //   expect(await (flavERC20Instance.name()).length).to.above(0, "Error 01 - Name can't be empty");
  // };

  it("...should have the name FlavCoin", async () => {
    expect(await flavERC20Instance.name()).to.equal(_name);
  });

  it("...should have the symbol FLAV", async () => {
    expect(await flavERC20Instance.symbol()).to.equal(_symbol);
  });

  it("...should have 18 decimals", async () => {
    expect(await flavERC20Instance.decimals()).to.be.bignumber.equal(_decimals);
  });

  it("...owner should have a balance equal to initialSupply", async () => {
    expect(await flavERC20Instance.balanceOf(_owner)).to.be.bignumber.equal(_initialSupply);
  });

  it("...recipient & owner should have a balance changed after transfer", async () => {
    let balanceOwnerBeforeTransfer = await flavERC20Instance.balanceOf(_owner);
    let balanceRecipientBeforeTransfer = await flavERC20Instance.balanceOf(_recipient)
    expect(balanceRecipientBeforeTransfer).to.be.bignumber.equal(new BN(0));
    expect(balanceOwnerBeforeTransfer).to.be.bignumber.equal(new BN(10000));
    await flavERC20Instance.transfer(_recipient, _amount, { from: _owner });
    expect(await flavERC20Instance.balanceOf(_owner)).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(_amount));
    expect(await flavERC20Instance.balanceOf(_recipient)).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(_amount));
  });

  it("...check if an approve is done", async () => {
    let allowanceBeforeApproval = await flavERC20Instance.allowance(_owner, _recipient);
    expect(allowanceBeforeApproval).to.be.bignumber.equal(new BN(0));
    await flavERC20Instance.approve(_recipient, _amount)
    let allowanceAfterApproval = await flavERC20Instance.allowance(_owner, _recipient);
    expect(allowanceAfterApproval).to.be.bignumber.equal(_amount);
  });

  it("...check if transferFrom done", async () => {
    await flavERC20Instance.approve(_recipient, _amount)
    await flavERC20Instance.transferFrom(_owner, _recipient, _amount, { from: _recipient });
    let balanceAfterTransfer = await flavERC20Instance.balanceOf(_recipient)
    expect(balanceAfterTransfer).to.be.bignumber.equal(_amount);
    let balanceOwnerAfterTransfer = await flavERC20Instance.balanceOf(_owner);
    expect(balanceOwnerAfterTransfer).to.be.bignumber.equal((new BN(10000)).sub(_amount));
  });

  // it("...should store the value 89.", async () => {
  // const flavERC20Instance = await FlavERC20.deployed();

  // Set value of 89
  // const myTx = await flavERC20Instance.setNumber(89, { from: accounts[0] });

  // Get stored value
  // const storedData = await flavERC20Instance.getNumber.call();

  // assert.equal(storedData, 89, "The value 89 was not stored.");

  // 3 functions of the OZ test helpers package
  // following expect let us check the value 89 and at the same time it is a uint 256
  // expect(storedData).to.be.bignumber.equal(new BN(89));

  // expectRevert is to check that if we overpass contract rules / expected behavior it triggers a revert
  // await expectRevert(simpleStorageInstance.setNumber(0, { from: accounts[0] }), "Revert successfully triggered");

  //expectEvent(myTx, "nameEvent", { _param1: value1, _param2: _value2 });
  // console.log("Salut, ceci est un log: " + storedData);

  //});

});
