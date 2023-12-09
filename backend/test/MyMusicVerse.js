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

        describe('Create a campaign', function() {

            describe('if the rules are not respected', function() {

                it("should revert if the target is less than the 1000", async () => {
                    const target = 100;
                    const title = "Test";
                    const tracksQuantity = 2;
            
                    await expect(myMusicVerse.createCampaign(target, title, tracksQuantity)).to.be.revertedWith('The minimum target to create a campaign is 1000 MUSD.');
                });

                it("should revert if the title is empty", async () => {
                    const target = 5000;
                    const title = "";
                    const tracksQuantity = 2;

                    await expect(myMusicVerse.createCampaign(target, title, tracksQuantity)).to.be.revertedWith('The title of the campaign cannot be empty.');
                });

                it("should revert if the quantity of tracks per album is 0", async () => {
                    const target = 5000;
                    const title = "Ma campagne";
                    const tracksQuantity = 0;

                    await expect(myMusicVerse.createCampaign(target, title, tracksQuantity)).to.be.revertedWith('The quantity of tracks inside this album cannot be 0.');
                });

            })

            describe('if the rules are respected', function() {

                const target = 5000;
                const title = "Ma campagne";
                const tracksQuantity = 2;

                it("should create a campaign", async () => {
                    const campaignQuantityBeforeCreation = await myMusicVerse.getArtistCampaigns(owner.address);
                    expect(campaignQuantityBeforeCreation.length).to.equal(0);

                    await myMusicVerse.createCampaign(target, title, tracksQuantity);

                    const campaignQuantityAfterCreation = await myMusicVerse.getArtistCampaigns(owner.address);
                    expect(campaignQuantityAfterCreation.length).to.equal(1);
                });

                it("should emit an event", async () => {
                    await expect(myMusicVerse.createCampaign(target, title, tracksQuantity)).to.emit(myMusicVerse,'CampaignCreated');
                });

            })

        

        })


        

        



    })

})