// SPDX-License-Identifier: GPL-3.0

/// @title SFTCollection - ERC1155 NFT Collection Contract
/// @author Clément HANQUIEZ
/// @notice This contract defines the SFTCollection ERC1155 contract, allowing the crowdfunding contract to mint unique album NFTs and batches of NFT parts.
/// @dev This contract extends the ERC1155 implementation from OpenZeppelin and supports metadata using the specified URL.

pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SFTCollection is ERC1155, Ownable {

    /// @dev Unique identifier for the album NFT.
    uint8 public ALBUM_NFT_ID = 0;
    /// @dev Starting identifier for individual track NFTs.
    uint8 public PART_NFT_ID = 1;
    /// @dev Number of tracks in the collection.
    uint8 public tracksQuantity;
    
    /// @dev Array of NFT IDs representing individual track NFTs.
    uint256[] public ids;

    /// @dev Event emitted when NFTs are minted.
    /// @param account The address receiving the minted NFTs.
    /// @param id The ID of the minted NFT.
    /// @param amount The amount of NFTs minted.
    event NFTsMinted(address account, uint256 id, uint256 amount);

    /// @dev Constructor to initialize the SFTCollection contract.
    /// @param _tracksQuantity Number of tracks in the collection.

    constructor(uint8 _tracksQuantity) ERC1155("https://your-metadata-api.com/api/token/0.json") Ownable(msg.sender) {

        // Set the number of tracks in the collection.
        tracksQuantity = _tracksQuantity;

        // Initialize the array of NFT IDs for individual tracks.
        ids = new uint8[](tracksQuantity);

        // Assign unique IDs to individual track NFTs.
       for (uint8 i = 0; i < tracksQuantity; i++) {
            ids[i] = PART_NFT_ID + i;
        }

    }


    /// @dev Mint a unique album NFT and assign it to the specified artist address.
    /// @param _artistAddress Address of the artist to whom the album NFT is assigned.
    function mintNFTAlbum(address _artistAddress) external onlyOwner() {
        _mint(_artistAddress, ALBUM_NFT_ID, 1, "");
    }


    /// @dev Mint batches of NFT parts and assign them to the specified account.
    /// @param account Address to which the NFT parts are assigned.
    /// @param amountPerNFT Number of parts to mint for each individual track NFT.

    function mintParts(address account, uint256 amountPerNFT) external onlyOwner() {

        // Initialize an array to store the amounts for each individual track.
        uint256[] memory amounts = new uint256[](tracksQuantity);

        // Assign the specified amount for each individual track.
        for (uint8 i = 0; i < tracksQuantity; i++) {
            amounts[i] = amountPerNFT;
        }

        // Mint the batch of NFT parts.
        _mintBatch(account, ids, amounts, "");

        // Emit an event for each minted NFT.
        for (uint8 i = 0; i < tracksQuantity; i++) {
            emit NFTsMinted(account, ids[i], amounts[i]);
        }
    }
  
}