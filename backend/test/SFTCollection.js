const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert, expect} = require('chai');
const {ethers } = require('hardhat');

const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Crowdfunding tests", function() {

    async function deployContract() {

        const [owner, otherAccount] = await ethers.getSigners();

        const SFTCollection = await ethers.getContractFactory("SFTCollection");
        const sftCollection = await SFTCollection.deploy(3);
        
        return {sftCollection, owner, otherAccount }
    }

    describe('Crowdfunding', function() {

        beforeEach(async function () {
            ({sftCollection, owner, otherAccount} = await loadFixture(deployContract));
        });

        describe('Deployment', function() {

            it("should deploy the contract", async function () {
                expect(await sftCollection.tracksQuantity()).to.equal(3);
            });

            it("should define an ID for each NFT", async function () {
                expect(await sftCollection.ids(2)).to.equal(3);
            });

            it("should have the unique NFT", async function () {
                expect(await sftCollection.balanceOf(owner.address, 0)).to.equal(1);
            });


        })


        describe('Mint', function() { 

            it("should mint parts correctly", async function () {
            
                const amountPerNFT = 100;
                const tracksQuantity = 3
            
                await sftCollection.mintParts(owner.address, amountPerNFT);
            
                for (let i = 1; i <= tracksQuantity; i++) {
                  const balance = await sftCollection.balanceOf(owner.address, i);
                  expect(balance).to.equal(amountPerNFT);
                }

            });


         })


            

    })

})