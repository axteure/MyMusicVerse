// SPDX-License-Identifier: GPL-3.0

/// @title MyMusicVerse - Crowdfunding Platform for Artists
/// @author Clément HANQUIEZ
/// @notice This contract represents a crowdfunding platform for artists, allowing them to create campaigns to fund their music projects.

pragma solidity 0.8.20;

import "./Crowdfunding.sol";
import "./MyUSD.sol";

contract MyMusicVerse {

    /// @dev Instance of the MyUSD contract used for payments and fundraising.
    MyUSD myUSD;

    /// @dev Mapping to keep track of campaigns created by each artist.
    mapping(address => address[]) public artistCampaigns;

    /// @dev Emitted when a new crowdfunding campaign is created.
    /// @param campaignAddress The address of the newly created crowdfunding campaign.
    /// @param title The title of the music project associated with the campaign.
    event CampaignCreated(address campaignAddress, string title);

    /// @dev Constructor to initialize the MyMusicVerse contract with the address of the MyUSD contract.
    /// @param _myUSDAddress The address of the MyUSD contract.
    constructor(address _myUSDAddress) {
        myUSD = MyUSD(_myUSDAddress);
    }

    /// @notice Creates a new crowdfunding campaign for an artist.
    /// @param _target The funding target in MUSD for the campaign.
    /// @param _title The title of the music project associated with the campaign.
    /// @param _tracksQuantity The number of tracks in the music project.
    /// @dev It requires a minimum target of 1000 MUSD, a non-empty title, and a non-zero quantity of tracks.
    function createCampaign (uint32 _target, string calldata _title, uint8 _tracksQuantity) external {
        require(_target >= 1000, "The minimum target to create a campaign is 1000 MUSD.");
        require(bytes(_title).length > 0, "The title of the campaign cannot be empty.");
        require(_tracksQuantity > 0, "The quantity of tracks inside this album cannot be 0.");

        uint256 timestamp = block.timestamp;

        // Create a new crowdfunding campaign using the Crowdfunding contract and its constructor.
        address campaignAddress = address(
            new Crowdfunding{salt: keccak256((abi.encodePacked(timestamp, msg.sender, _target, _title)))}(address(myUSD),msg.sender, _target, _title, _tracksQuantity)
        );

        // Add the campaign address to the list of campaigns for the artist.
        artistCampaigns[msg.sender].push(campaignAddress);

        // Emit an event to signify the creation of a new campaign.
        emit CampaignCreated(campaignAddress, _title);
    }

    /// @notice Retrieves the list of campaign addresses created by a specific artist.
    /// @param artistAddress The address of the artist.
    /// @return An array of campaign addresses associated with the artist.
    function getArtistCampaigns(address artistAddress) external view returns (address[] memory) {
        return artistCampaigns[artistAddress];
    }

	
}
