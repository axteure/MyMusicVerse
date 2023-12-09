// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;

import "./Crowdfunding.sol";
import "./MyUSD.sol";

contract MyMusicVerse {

    MyUSD myUSD;

    mapping(address => address[]) public artistCampaigns;

    event CampaignCreated(address campaignAddress, string title, uint32 target, uint8 tracksQuantity);

    constructor(address _myUSDAddress) {
        myUSD = MyUSD(_myUSDAddress);
    }

    function createCampaign (uint32 _target, string calldata _title, uint8 _tracksQuantity) external {
        require(_target >= 1000, "The minimum target to create a campaign is 1000 MUSD.");
        require(bytes(_title).length > 0, "The title of the campaign cannot be empty.");
        require(_tracksQuantity > 0, "The quantity of tracks inside this album cannot be 0.");

        uint256 timestamp = block.timestamp;

        address campaignAddress = address(
            new Crowdfunding{salt: keccak256((abi.encodePacked(timestamp, msg.sender, _target, _title)))}(address(myUSD),msg.sender, _target, _title, _tracksQuantity)
        );

        artistCampaigns[msg.sender].push(campaignAddress);

        emit CampaignCreated(campaignAddress, _title, _target, _tracksQuantity);
    }

    function getArtistCampaigns(address artistAddress) external view returns (address[] memory) {
        return artistCampaigns[artistAddress];
    }

	
}
