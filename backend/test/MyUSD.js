const {loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {assert, expect} = require('chai');
const {ethers } = require('hardhat');

const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("My USD tests", function() {

    async function deployContract() {
        const [owner, otherAccount] = await ethers.getSigners();
        const MyUSD = await ethers.getContractFactory("MyUSD");
        const myUSD = await MyUSD.deploy(MyUSD);

        return {myUSD, owner, otherAccount }
    }

    describe('MyUSD', function() {

        beforeEach(async function () {
            ({myUSD, owner, otherAccount} = await loadFixture(deployContract));
        });


        describe('Deployment', function() {
            it('should deploy the smart contract', async function() {
                const symbol = await myUSD.symbol();
                expect(symbol).to.equal("MUSD");
            })
        })

        it('should allow faucet to mint tokens', async function () {

            const recipient = otherAccount.address;
            const amount = 100

            const recipientBalanceBeforeFaucet = await myUSD.balanceOf(recipient);
            expect(recipientBalanceBeforeFaucet).to.equal(0);

                
            await myUSD.connect(otherAccount).faucet(recipient, 100);
            const recipientBalanceAfterFaucet = await myUSD.balanceOf(recipient);
        
            expect(recipientBalanceAfterFaucet).to.equal(amount);
          });

    })

})