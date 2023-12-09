const hre = require("hardhat");

async function main() {

    // Attachement des contrats
    const MyUSDContract = await ethers.getContractAt("MyUSD", '0x5FbDB2315678afecb367f032d93F642f64180aa3');
    const MyMusicVerseContract = await ethers.getContractAt("MyMusicVerse", '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');

    // Récupération des wallet de test Hardhat
    const [hardhat1, hardhat2] = await ethers.getSigners();

    // Mint de 10000 MUSD
    await MyUSDContract.faucet(hardhat1.address, 10000);
    const balance = await MyUSDContract.balanceOf(hardhat1.address);
    console.log(`Balance of ${hardhat1.address}: ${balance.toString()}`);

    // Création d'une campagne
    await MyMusicVerseContract.createCampaign(3000, "Ma campagne Alyra", 4);
    console.log('Campagne créée !');

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});