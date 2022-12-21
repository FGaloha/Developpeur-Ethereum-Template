const { assert, expect } = require("chai");
const { splitSignature } = require("ethers/lib/utils");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of Spa smart contract", function () {
    let accounts;
    let spa;

    before(async () => {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
    })

    describe("Add", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
      })

      it("should be possible to add an animal", async function () {
        const animalAdded = await spa.add("doberman", 50, 5);
        // check it has been added & info correct
        const myAnimalAdded = await spa.get(0);
        assert.equal(myAnimalAdded.race, "doberman");
        assert.equal(myAnimalAdded.size, 50);
        assert.equal(myAnimalAdded.age, 5);
        // check it emit the event
        await expect(animalAdded)
          .to.emit(spa, ' animalAdded')
          .withArgs(0);
      })

    })

    describe("Get", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
        const animalAdded1 = await spa.add("doberman", 70, 5);
        const animalAdded2 = await spa.add("Cocker", 30, 2);
        const animalAdded3 = await spa.add("Terrier", 50, 7);
        const animalAdded4 = await spa.add("Chihuahua", 25, 6);
      })

      it("should be possible to get animal info of the first animal added", async function () {
        const myAnimalAdded = await spa.get(0);
        assert.equal(myAnimalAdded.race, "doberman");
        assert.equal(myAnimalAdded.size, 70);
        assert.equal(myAnimalAdded.age, 5);
      })

      it("should be possible to get animal info of the last animal added", async function () {
        const myAnimalAdded = await spa.get(3);
        assert.equal(myAnimalAdded.race, "Chihuahua");
        assert.equal(myAnimalAdded.size, 25);
        assert.equal(myAnimalAdded.age, 6);
      })

      it("should be possible to get animal info of the an animal added in the middle", async function () {
        const myAnimalAdded = await spa.get(2);
        assert.equal(myAnimalAdded.race, "Terrier");
        assert.equal(myAnimalAdded.size, 50);
        assert.equal(myAnimalAdded.age, 7);
      })
    })

    describe("Set", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
        const animalAdded1 = await spa.add("doberman", 70, 5);
      })

      it("Should be possible to set new attributes to an existing animal without changing adoption status", async function () {
        const infos = await spa.get(0);
        const adoptionStatus = infos.isAdopted;
        await spa.set(0, "terrier", 70, 5);
        const myAnimalUpdated = await spa.get(0);
        assert.equal(myAnimalUpdated.race, "terrier");
        assert.equal(myAnimalUpdated.size, 70);
        assert.equal(myAnimalUpdated.age, 5);
        assert.equal(myAnimalUpdated.isAdopted, adoptionStatus);
      })
    })

    describe("Remove", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
        const animalAdded1 = await spa.add("doberman", 70, 5);
        const animalAdded2 = await spa.add("Cocker", 30, 2);
        const animalAdded3 = await spa.add("Terrier", 50, 7);
      })

      it("Should be possible to remove an existing animal", async function () {
        await spa.remove(0);
        const myAnimalRemoved = await spa.get(0);
        assert.equal(myAnimalRemoved.race, "");
        assert.equal(myAnimalRemoved.size, 0);
        assert.equal(myAnimalRemoved.age, 0);
      })
    })

    describe("Adopt", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
        const animalAdded1 = await spa.add("doberman", 70, 5);
        const animalAdded2 = await spa.add("Cocker", 30, 2);
        const animalAdded3 = await spa.add("Terrier", 50, 7);
      })

      it("Should NOT be possible to adopt an animal already adopted", async function () {
        await spa.adopt(0);
        await expect(spa.adopt(0)).to.be.revertedWithCustomError(
          spa,
          "Spa__AlreadyAdopted"
        );
      })

      it("Should be possible to adopt an existing animal", async function () {
        const adoption = await spa.adopt(2);
        const myAnimalAdopted = await spa.get(2);
        assert.equal(myAnimalAdopted.isAdopted.toString(), "true");
        const myAdopter = await deployer.getAddress()
        await expect(adoption)
          .to.emit(spa, ' animalAdopted')
          .withArgs(2, myAdopter);
      })
    })

    describe("GetAdoption", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
        await spa.add("doberman", 70, 5);
        await spa.adopt(0);
      })

      it("Should be possible to get the animal adopted by an address", async function () {
        const myAdopter = await deployer.getAddress();
        const myAnimalAdopted = await spa.getAdoption(myAdopter);
        assert.equal(myAnimalAdopted.race, "doberman");
        assert.equal(myAnimalAdopted.size, 70);
        assert.equal(myAnimalAdopted.age, 5);
      })
    })

    describe("adoptIfMax", function () {
      beforeEach(async () => {
        await deployments.fixture(["spa"])
        spa = await ethers.getContract("Spa")
        await spa.add("doberman", 70, 5);
      })

      it("Should NOT be possible to adopt an existing animal if it does not feet the max criteria", async function () {
        const adoption = await spa.callStatic.adoptIfMax("doberman", 30, 6);
        assert.equal(adoption, false);
      })

      it("Should be possible to adopt an existing animal if it feets the max criteria", async function () {
        const adoption = await spa.callStatic.adoptIfMax("doberman", 80, 6);
        assert.equal(adoption, true);
      })
    })

    describe("workflow from adding to adopt", function () {
      before(async () => {
        await deployments.fixture(["spa"]);
        spa = await ethers.getContract("Spa");
      })

      it("should be possible to add an animal", async function () {
        const animalAdded = await spa.add("doberman", 50, 5);
        // check it has been added & info correct
        const myAnimalAdded = await spa.get(0);
        assert.equal(myAnimalAdded.race, "doberman");
        assert.equal(myAnimalAdded.size, 50);
        assert.equal(myAnimalAdded.age, 5);
        // check it emit the event
        await expect(animalAdded)
          .to.emit(spa, ' animalAdded')
          .withArgs(0);
      })

      it("should be possible to add another animal", async function () {
        const animalAdded = await spa.add("terrier", 40, 2);
        // check it has been added & info correct
        const myAnimalAdded = await spa.get(1);
        assert.equal(myAnimalAdded.race, "terrier");
        assert.equal(myAnimalAdded.size, 40);
        assert.equal(myAnimalAdded.age, 2);
        // check it emit the event
        await expect(animalAdded)
          .to.emit(spa, ' animalAdded')
          .withArgs(1);
      })

      it("should be possible to get the animal info", async function () {
        const myAnimalAdded = await spa.get(0);
        assert.equal(myAnimalAdded.race, "doberman");
        assert.equal(myAnimalAdded.size, 50);
        assert.equal(myAnimalAdded.age, 5);
      })

      it("Should be possible to set new attributes to an existing animal", async function () {
        const infos = await spa.get(0);
        const adoptionStatus = infos.isAdopted;
        await spa.set(0, "doberman", 80, 5);
        const myAnimalUpdated = await spa.get(0);
        assert.equal(myAnimalUpdated.race, "doberman");
        assert.equal(myAnimalUpdated.size, 80);
        assert.equal(myAnimalUpdated.age, 5);
        assert.equal(myAnimalUpdated.isAdopted, adoptionStatus);
      })

      it("Should be possible to adopt an existing animal without criteria", async function () {
        const adoption = await spa.adopt(0);
        const myAnimalAdopted = await spa.get(0);
        assert.equal(myAnimalAdopted.isAdopted.toString(), "true");
        const myAdopter = await deployer.getAddress()
        await expect(adoption)
          .to.emit(spa, ' animalAdopted')
          .withArgs(0, myAdopter);
      })

      it("Should be possible to adopt an existing animal with criteria", async function () {
        const adoption = await spa.callStatic.adoptIfMax("terrier", 80, 2);
        assert.equal(adoption, true);
      })

      it("Should be possible to remove an existing animal", async function () {
        await spa.remove(1);
        const myAnimalRemoved = await spa.get(1);
        assert.equal(myAnimalRemoved.race, "");
        assert.equal(myAnimalRemoved.size, 0);
        assert.equal(myAnimalRemoved.age, 0);
      })

    })

  })
