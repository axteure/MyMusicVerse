const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert, expect} = require('chai');
const {ethers } = require('hardhat');

const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("MyMusicVerse tests", function() {

    async function deployContract() {
        const [owner, otherAccount] = await ethers.getSigners();

        const MyUSD = await ethers.getContractFactory("MyUSD");
        const myUSD = await MyUSD.deploy();

        const MyMusicVerse = await ethers.getContractFactory("MyMusicVerse");
        const myMusicVerse = await MyMusicVerse.deploy(myUSD);

        return {myUSD, myMusicVerse, owner, otherAccount }
    }

    describe('MyMusicVerse', function() {

        beforeEach(async function () {
            ({myUSD, myMusicVerse, owner, otherAccount} = await loadFixture(deployContract));
        });

        describe('Deployment', function() {

            it("should deploy the contract", async () => {
                const contractAddress = myMusicVerse.address;
                assert.notEqual(contractAddress, "0x0000000000000000000000000000000000000000", "Contract not deployed");
            });

        })

        describe('Create a campaign', function() {

            describe('if the rules are not respected', function() {

                it("should revert if the target is less than the 1000", async () => {
                    const target = 100;
                    const title = "Test";
            
                    await expect(myMusicVerse.createCampaign(target, title)).to.be.revertedWith('The minimum target to create a campaign is 1000 MUSD.');
                });

                it("should revert if the title is empty", async () => {
                    const target = 5000;
                    const title = "";
            
                    await expect(myMusicVerse.createCampaign(target, title)).to.be.revertedWith('The title of the campaign cannot be empty.');
                });

            })

            describe('if the rules are respected', function() {

                let target = 5000;
                let title = "Ma campagne";

                it("should create a campaign", async () => {
                    const campaignQuantityBeforeCreation = await myMusicVerse.getArtistCampaigns(owner.address);
                    expect(campaignQuantityBeforeCreation.length).to.equal(0);

                    await myMusicVerse.createCampaign(target, title);

                    const campaignQuantityAfterCreation = await myMusicVerse.getArtistCampaigns(owner.address);
                    expect(campaignQuantityAfterCreation.length).to.equal(1);
                });

                it("should emit an event", async () => {
                    await expect(myMusicVerse.createCampaign(target, title)).to.emit(myMusicVerse,'CampaignCreated');
                });

            })

        

        })


        

        



    })

})