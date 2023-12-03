const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert, expect} = require('chai');
const {ethers } = require('hardhat');

const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("Crowdfunding tests", function() {

    async function deployContract() {

        const [owner, otherAccount] = await ethers.getSigners();

        const MyUSD = await ethers.getContractFactory("MyUSD");
        const myUSD = await MyUSD.deploy();

        const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
        const crowdfunding = await Crowdfunding.deploy(myUSD, owner, 5000, "Ma campagne");
        
        return {myUSD, crowdfunding, owner, otherAccount }
    }

    describe('Crowdfunding', function() {

        beforeEach(async function () {
            ({myUSD, crowdfunding, owner, otherAccount} = await loadFixture(deployContract));
        });

        describe('Deployment', function() {

            it("should have the correct MyUSD address", async function () {
/*
                const crowdfundingMyUSDAddress = await crowdfunding.myUSD;
                expect(crowdfundingMyUSDAddress).to.equal(myUSD);*/
              });
        })

        describe('Deposit', function(){

            let amount = 100

            beforeEach(async function () {
                await myUSD.faucet(owner.address,6000);
                await myUSD.approve(crowdfunding, amount);
            });

            describe('If the rules are respected', function() {

                it("should make a deposit", async () => {

                    let balanceOfOwnerBeforeTransfer = await myUSD.balanceOf(owner)
                    let balanceOfCrowdfundingBeforeTransfer = await myUSD.balanceOf(crowdfunding)
                    let balanceOfContributionBeforeTransfer = await crowdfunding.contributors(owner)
                    expect(balanceOfOwnerBeforeTransfer).to.equal(6000);
                    expect(balanceOfCrowdfundingBeforeTransfer).to.equal(0);
                    expect(balanceOfContributionBeforeTransfer).to.equal(0);
    
                    await crowdfunding.deposit(amount);
    
                    let balanceAfterTransfer = await myUSD.balanceOf(owner)
                    let balanceOfCrowdfundingAfterTransfer = await myUSD.balanceOf(crowdfunding)
                    let balanceOfContributionAfterTransfer = await crowdfunding.contributors(owner)
                    expect(balanceAfterTransfer).to.equal(6000-amount);
                    expect(balanceOfCrowdfundingAfterTransfer).to.equal(amount);
                    expect(balanceOfContributionAfterTransfer).to.equal(amount);

                    
                });
    
                it("should emit an event", async () => {
                    await expect(crowdfunding.deposit(amount)).to.emit(crowdfunding,'DepositReceived');
                });

            })

            describe('If the rules are not respected', function() {

                it("should revert if the allowance is not enough", async () => {
                    await expect(crowdfunding.deposit(500)).to.be.revertedWith('The allowance is not enough do to this transfer.');
                });

                it("should not allow deposit after closing date", async () => {
                    let closingDate = await crowdfunding.closingDate();
                    let afterClosingDate = parseInt(closingDate)+10;
                    await helpers.time.increaseTo(afterClosingDate);

                    await expect(crowdfunding.deposit(100)).to.be.revertedWith('Campaign is closed.');
                });

                it('should not allow deposit exceeding campaign limit', async () => {
                    await expect(crowdfunding.deposit(6000)).to.be.revertedWith('Amount exceeds the campaign limit.');
                });

                it('should not allow total deposit exceeding campaign limit', async () => {
                    await myUSD.approve(crowdfunding, 5500)

                    await crowdfunding.deposit(4800)

                    await expect(crowdfunding.deposit(300)).to.be.revertedWith('Total deposit exceeds the campaign limit.');
                });

                it('should not allow total deposit if the campaign is closed', async () => {
                    await myUSD.approve(crowdfunding, 5500)

                    await crowdfunding.deposit(5000)

                    await expect(crowdfunding.deposit(300)).to.be.revertedWith('Campaign is closed.');
                });
                
            })

        })

        describe('Withdrawal', function(){

            describe('If the rules are respected', function() {

                beforeEach(async function () {
                    await myUSD.faucet(owner.address,5000);
                    await myUSD.approve(crowdfunding, 5000);
                    await crowdfunding.deposit(5000);
                });

                it("should make a withdrawal", async () => {

                    let balanceOfOwnerBeforeWithdrawal = await myUSD.balanceOf(owner);
                    let balanceOfCrowdfundingBeforeWithdrawal = await myUSD.balanceOf(crowdfunding);
                    expect(balanceOfOwnerBeforeWithdrawal).to.equal(0);
                    expect(balanceOfCrowdfundingBeforeWithdrawal).to.equal(5000);
    
                    await crowdfunding.withdraw();
    
                    let balanceOfOwnerAfterWithdrawal = await myUSD.balanceOf(owner)
                    let balanceOfCrowdfundingAfterWithdrawal = await myUSD.balanceOf(crowdfunding)
                    expect(balanceOfOwnerAfterWithdrawal).to.equal(5000);
                    expect(balanceOfCrowdfundingAfterWithdrawal).to.equal(0);
                });

                
                it("should emit an event", async () => {
                    await expect(crowdfunding.withdraw()).to.emit(crowdfunding,'WithdrawalCompleted').withArgs(owner.address, 5000);;
                });
    
            })

            describe('If the rules are not respected', function() {

                beforeEach(async function () {
                    await myUSD.faucet(owner.address,5000);
                    await myUSD.approve(crowdfunding, 5000);
                    await crowdfunding.deposit(4000);
                });

                it("should revert if the sender is not the artist", async () => {
                    await expect(crowdfunding.connect(otherAccount).withdraw()).to.be.revertedWith('Only the artist can withdraw the funds.');
                });

                it("should revert if the target is not reached", async () => {
                    await expect(crowdfunding.withdraw()).to.be.revertedWith('The target is not reached.');
                });

            });
            
        })

        describe('Refund', function(){

            describe('If the rules are respected', function() {

                beforeEach(async function () {
                    await myUSD.faucet(owner.address,5000);
                    await myUSD.approve(crowdfunding, 3000);
                    await crowdfunding.deposit(3000);
                    
                    let closingDate = await crowdfunding.closingDate();
                    let afterClosingDate = parseInt(closingDate)+10;
                    await helpers.time.increaseTo(afterClosingDate);
                });

                it("should refund the contributor", async () => {
                    let balanceOfOwnerBeforeRefund = await myUSD.balanceOf(owner)
                    let balanceOfCrowdfundingBeforeRefund = await myUSD.balanceOf(crowdfunding)
                    let balanceOfContributionBeforeRefund = await crowdfunding.contributors(owner)
                    expect(balanceOfOwnerBeforeRefund).to.equal(2000);
                    expect(balanceOfCrowdfundingBeforeRefund).to.equal(3000);
                    expect(balanceOfContributionBeforeRefund).to.equal(3000);
    
                    await crowdfunding.refund();
    
                    let balanceOfOwnerAfterRefund = await myUSD.balanceOf(owner)
                    let balanceOfCrowdfundingAfterRefund = await myUSD.balanceOf(crowdfunding)
                    let balanceOfContributionAfterRefund = await crowdfunding.contributors(owner)
                    expect(balanceOfOwnerAfterRefund).to.equal(5000);
                    expect(balanceOfCrowdfundingAfterRefund).to.equal(0);
                    expect(balanceOfContributionAfterRefund).to.equal(0);

                });

                
                it("should emit an event", async () => {
                    await expect(crowdfunding.refund()).to.emit(crowdfunding,'RefundCompleted').withArgs(owner.address, 3000);;
                });
    
            })

            describe('If the rules are not respected', function() { 

                beforeEach(async function () {
                    await myUSD.faucet(owner.address,5000);
                    await myUSD.approve(crowdfunding, 5000);
                    await crowdfunding.deposit(4900);
                    
                    let closingDate = await crowdfunding.closingDate();
                    let beforeClosingDate = parseInt(closingDate)-10;
                    await helpers.time.increaseTo(beforeClosingDate);
                });

                it("should revert if the target has been reached", async () => {
                    await crowdfunding.deposit(100);

                    await expect(crowdfunding.refund()).to.be.revertedWith('The target has been reached, you can not be refunded.');
                });

                it("should revert if the campaign is not over", async () => {
                    await expect(crowdfunding.refund()).to.be.revertedWith('The campaign is not over yet, you can not be refunded.');
                });
             })

        })

    })

})