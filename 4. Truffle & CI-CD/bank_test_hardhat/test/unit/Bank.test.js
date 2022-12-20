const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
// const { _nameprepTableC } = require("@ethersproject/strings/lib/idna");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of Bank smart contract", function () {
    let accounts;
    let bank;

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0];
      user = accounts[1];
    })

    describe("Deployment", async function () {
      it("should deploy the smart contract", async function () {
        await deployments.fixture(["bank"]);
        bank = await ethers.getContract("Bank");
      })
    })

    describe("Deposit", async function () {
      it("should be possible to deposit money for a user if amount respect the minimum deposit", async function () {
        const myDeposit = await bank.connect(user).deposit({ value: 100 });
        const userAccount = await bank.connect(user).getBalanceAndLastDeposit();
        expect(userAccount.balance).eq(100);
        expect(userAccount.lastDeposit).above(0);
        console.log(user.getAddress());
        await expect(myDeposit)
          .to.emit(bank, 'etherDeposited')
          .withArgs('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 100);
      })

      it("should NOT be possible to deposit 0", async function () {
        await expect(
          bank.connect(user).deposit()
        ).to.be.revertedWith("Transfer needs to be 1 wei minimum !")
      })
    })

    describe("Withdraw", async function () {
      it("should be possible for a user to withdraw his/her money", async function () {
        const myWithdraw = await bank.connect(user).withdraw(50);
        const userAccount = await bank.connect(user).getBalanceAndLastDeposit();
        expect(userAccount.balance).eq(50);
        await expect(myWithdraw)
          .to.emit(bank, 'etherWithdrawed')
          .withArgs('0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 50);
      })

      // correction of previous test including gas fee
      it("should withdraw if enough ethers are deposited by this account on the smart contract", async function () {
        const balanceOfUser = await user.getBalance()

        // GAS COST
        const transactionResponse = await bank.connect(user).withdraw(10)
        const transactionReceipt = await transactionResponse.wait()
        // console.log(transactionReceipt)
        // console.log(user.getAddress())
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)

        let bn10 = ethers.BigNumber.from("10")
        let newBalanceOfUser = await user.getBalance()

        let result = balanceOfUser.add(bn10).sub(gasCost)
        assert.equal(result.toString(), newBalanceOfUser.toString())
        // console.log(result.toString(), newBalanceOfUser.toString());

        let account = await bank.connect(user).getBalanceAndLastDeposit()
        assert(account.balance.toString() === "40");
        assert(account.lastDeposit.toString().length === 10)
      })

      it("should not be possible for a user to withdraw more than his/her money", async function () {
        await expect(
          bank.connect(user).withdraw(150)
        ).to.be.revertedWith("You do not have enough deposit");
      })

      it("should not be possible for a user to withdraw money when he has never deposited", async function () {
        await expect(
          bank.withdraw(150)
        ).to.be.revertedWith("You do not have enough deposit");
      })
    })

  })
