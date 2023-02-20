const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Complete workflow testing Factory, Collection & Market Smart Contracts working together", function () {
    let accounts;
    let collection;
    let market;

    // console.log(ethers.version);

    // DEFINITIONS
    // Owner is the address who deployed the Factory & Market contract
    // A seller is an address who has been registered by the owner & is able to create NFTs contracts through the Factory contract & manage them
    // A simple user is the other type of contract user with limited rights to sale/buy NFTs or view contract information

    before(async () => {
      accounts = await ethers.getSigners()
      owner = accounts[0]
      seller1 = accounts[1]
      seller2 = accounts[2]
      seller3 = accounts[3]
      simple_user = accounts[4]
      simple_user2 = accounts[5]
    })

    describe("complete workflow", function () {

      beforeEach(async () => {
        await deployments.fixture(["factory"]);
        factory = await ethers.getContract("Factory");
        // await collection.init(50, ethers.utils.parseEther('0.05'),
        //   'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        await deployments.fixture("market", [2000000000000000, 1000000000000000, 250]);
        market = await ethers.getContract("Market");

        await factory.setSubsidiary(seller1.address, 'Paris', 'PAR')
        await factory.setSubsidiary(seller2.address, 'Cannes', 'CAN')
        await factory.setSubsidiary(seller3.address, 'Saint-Tropez', 'STP')

        const collectionA = await factory.connect(seller1)
          .createNFTCollection(50, ethers.utils.parseEther('0.005'),
            'ipfs://bafybeifgrexwzvjkgql75wruqorhhm5l2estqug3ayfpi3kqwtgbxtisdi/');
        const collectionB = await factory.connect(seller1)
          .createNFTCollection(50, ethers.utils.parseEther('0.005'),
            'ipfs://bafybeifqkx4kfnov6khb76xwrchwi6zwspujgwph2diwh3ks5j2e226g5i/');
        const collectionC = await factory.connect(seller2)
          .createNFTCollection(50, ethers.utils.parseEther('0.005'),
            'ipfs://bafybeihlm6bfwnexcxexsj7twyvel7ndkiweuohgvutupjrwgzwoidt6aa/');
      })

      it("should be possible for the owner of the Factory contract to get the Subsidiary's information", async function () {
        const getSubsidiary = await factory.getSubsidiary(seller1.address);
      })

      it("should be possible for a seller of the Factory contract to get the Subsidiary's information", async function () {
        const getSubsidiary = await factory.connect(seller1).getSubsidiary(seller2.address);
      })

      it("should be possible for a simple user to get the Subsidiary's information", async function () {
        const getSubsidiary = await factory.connect(simple_user).getSubsidiary(seller1.address);
      })

      it("should be possible for the owner of the Factory to deactivate a subsidiary", async function () {
        await expect(factory.deactivateSubsidiary(seller3.address))
          .to.emit(factory, 'SubsidiaryDeactivated')
          .withArgs(seller3.address, 'Saint-Tropez', 'STP');
      })

      it("should be possible for the owner of the Factory to update the name & symbol of the subsidiary", async function () {
        await expect(factory.updateSubsidiary(seller1.address, 'Paris 1', 'PAR1'))
          .to.emit(factory, 'SubsidiaryUpdated')
          .withArgs(seller1.address, 'Paris 1', 'PAR1');
      })

      it("should be possible for the owner to get the max supply value of a collection", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[0]['args'][1])
        const maxSupply = await contract.getMaxSupply();
      })

      it("should be possible for a simple_user to get the max supply value of a collection", async function () {
        const collectionCreationEventEnd = await factory.queryFilter('CollectionCreated');
        const contract = await ethers.getContractAt('Collection', collectionCreationEventEnd[1]['args'][1])
        const maxSupply = await contract.connect(simple_user).getMaxSupply();
      })

    })



  })
