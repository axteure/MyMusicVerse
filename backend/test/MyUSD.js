const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert, expect} = require('chai');
const {ethers } = require('hardhat');

const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("My USD tests", function() {

    async function deployContract() {
        const [owner, otherAccount] = await ethers.getSigners();
        const MyUSD = await ethers.getContractFactory("MyUSD");
        const myUSD = await MyUSD.deploy();

        return {myUSD, owner, otherAccount }
    }

    describe('MyUSD', function() {

        beforeEach(async function () {
            ({myUSD, owner, otherAccount} = await loadFixture(deployContract));
        });


        describe('Deployment', function() {

            it('should deploy the contract with correct name and symbol', async function () {

                expect(await myUSD.name()).to.equal('USD Stablecoin');
                expect(await myUSD.symbol()).to.equal('MUSD');
                
              });
        })

        describe('Usage', function() {

            it('should not allow faucet with zero amount', async function () {
                const recipient = otherAccount.address;
                const amount = 0;
            
                await expect(myUSD.connect(otherAccount).faucet(recipient, amount)).to.be.revertedWith('The minimum amount is 1.');
            });
    
            it('should allow faucet to mint tokens', async function () {
    
                const recipient = otherAccount.address;
                const amount = 100
    
                const recipientBalanceBeforeFaucet = await myUSD.balanceOf(recipient);
                expect(recipientBalanceBeforeFaucet).to.equal(0);
    
                await myUSD.connect(otherAccount).faucet(recipient, amount);
                const recipientBalanceAfterFaucet = await myUSD.balanceOf(recipient);
            
                expect(recipientBalanceAfterFaucet).to.equal(amount);
    
              });
    
    
              it('should emit an event', async function () {
    
                const recipient = otherAccount.address;
                const amount = 100
    
                await expect(myUSD.faucet(recipient, amount)).to.emit(myUSD,'MUSDMinted').withArgs(recipient, amount);
    
              });

        })

    })

})