// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SFTCollection is ERC1155, Ownable {

    uint8 public ALBUM_NFT_ID = 0;
    uint8 public PART_NFT_ID = 1;
    uint8 public tracksQuantity;
    uint256[] public ids;


    event NFTsMinted(address account, uint256 id, uint256 amount);

    constructor(uint8 _tracksQuantity) ERC1155("https://your-metadata-api.com/api/token/0.json") Ownable(msg.sender) {

        tracksQuantity = _tracksQuantity;

        ids = new uint8[](tracksQuantity);

       for (uint8 i = 0; i < tracksQuantity; i++) {
            ids[i] = PART_NFT_ID + i;
        }

    }

    function mintNFTAlbum(address _artistAddress) external onlyOwner() {
        _mint(_artistAddress, ALBUM_NFT_ID, 1, "");
    }

    function mintParts(address account, uint256 amountPerNFT) external onlyOwner() {

        uint256[] memory amounts = new uint256[](tracksQuantity);

        for (uint8 i = 0; i < tracksQuantity; i++) {
            amounts[i] = amountPerNFT;
        }

        _mintBatch(account, ids, amounts, "");

        for (uint8 i = 0; i < tracksQuantity; i++) {
            emit NFTsMinted(account, ids[i], amounts[i]);
        }
    }
  
}