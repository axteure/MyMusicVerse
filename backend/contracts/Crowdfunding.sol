// SPDX-License-Identifier: GPL-3.0

/// @title Crowdfunding - Smart Contract for Music Crowdfunding Campaigns
/// @author Clément HANQUIEZ
/// @notice This contract facilitates crowdfunding campaigns for artists, allowing contributors to deposit funds, the artist to withdraw funds, and mint NFTs based on contributions.

pragma solidity 0.8.20;
 
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "./SFTCollection.sol";

contract Crowdfunding {

    /// @dev Instance of the MyUSD ERC20 token contract.
	IERC20 public myUSD;

    /// @dev Mapping to keep track of contributors and their contributions.
	mapping(address => uint32) public contributors;

	// VARIABLES //

    /// @dev Address of the artist running the campaign.
	address public artistAddress;

    /// @dev Target funding amount in MUSD for the campaign.
    uint32 public target;

	/// @dev Total amount deposited by contributors.
    uint32 public totalDeposited;

	/// @dev Campaign start timestamp.
    uint256 public startingDate;

    /// @dev Campaign end timestamp.
    uint256 public closingDate;

    /// @dev Title of the music project associated with the campaign.
    string public title;

	/// @dev Boolean indicating whether the campaign is open or closed.
    bool public isOpened = true;

	/// @dev Address of the SFTCollection contract representing the album NFTs.
	address public AlbumCollectionAddress;

    /// @dev Boolean indicating whether the album NFTs have been deployed.
    bool public sftDeployed = false;

    /// @dev Quantity of tracks in the music project.
    uint8 public tracksQuantity;

	// EVENTS //

	/// @dev Emitted when a contributor makes a deposit.
	event DepositReceived(address sender, uint32 amount);

    /// @dev Emitted when the artist successfully withdraws funds.
	event WithdrawalCompleted(address artistAddress, uint32 amount);

	/// @dev Emitted when album NFTs are successfully minted.
	event AlbumNFTMinted(address SFTCollectionAddress,address artistAddress);

    /// @dev Emitted when a contributor is refunded.
	event RefundCompleted(address contributor, uint32 amount);

	/// @dev Emitted when NFTs are attributed to a contributor.
	event NFTsAttributed(address contributor, uint amount);

	// ERRORS //

	error CampaignNotOverYet();
	error AmountExceedsLimit();
	error TotalDepositExceedsLimit();
	error InsufficientAllowance();
	error OnlyArtistAllowed();
	error TargetNotReached();
	error TargetReached();
	error SFTNotDeployed();
	error SFTAlreadyDeployed();
	error NothingToMint();

	// Constructor to initialize the Crowdfunding contract.
    /// @param _MyUSDAddress The address of the MyUSD contract.
    /// @param _artistAddress The address of the artist running the campaign.
    /// @param _target The funding target in MUSD for the campaign.
    /// @param _title The title of the music project associated with the campaign.
    /// @param _tracksQuantity The number of tracks in the music project.
	constructor(address _MyUSDAddress, address _artistAddress, uint32 _target, string memory _title, uint8 _tracksQuantity) {

		myUSD = IERC20(_MyUSDAddress);

		artistAddress = _artistAddress;
		target = _target;
        startingDate = block.timestamp;
        closingDate = block.timestamp + 30 days;
    	title = _title;
		tracksQuantity = _tracksQuantity;
	}

	/// @notice Allows a contributor to deposit MUSD into the crowdfunding campaign.
	/// @param _amount The amount of MUSD to deposit.
	/// @dev This function checks if the campaign is open, if the deposit amount exceeds the campaign limit, if the total deposit exceeds the campaign limit,
	/// and if the contributor's allowance is sufficient for the deposit. If all checks pass, the function transfers MUSD from the contributor to the contract,
	/// updates the total deposited amount, increments the contributor's balance, and closes the campaign if the total deposited amount reaches the target.
	/// Emits a DepositReceived event.
	function deposit(uint32 _amount) external {
  
		if(block.timestamp > closingDate) revert CampaignNotOverYet();
		if(!isOpened) revert CampaignNotOverYet();
    	if(_amount > target) revert AmountExceedsLimit();
		if(totalDeposited + _amount > target) revert TotalDepositExceedsLimit();
		if(myUSD.allowance(msg.sender, address(this)) < _amount) revert InsufficientAllowance();

    	// Transfer MUSD from the contributor to the contract.
		myUSD.transferFrom(msg.sender, address(this), _amount);

	    // Update total deposited amount and contributor's balance.
		totalDeposited += _amount;
		contributors[msg.sender] += _amount;

	    // If the total deposited amount reaches the target, close the campaign.
		if (totalDeposited >= target) {
			isOpened = false;
		}

	    // Emit a DepositReceived event.
		emit DepositReceived(msg.sender, _amount);
	}

	/// @notice Allows the artist to withdraw funds from the crowdfunding campaign.
	/// @dev This function checks if the caller is the artist and if the total deposited amount has reached the target.
	/// If both conditions are met, the function transfers the total deposited amount to the artist's address.
	/// It then deploys a new SFTCollection contract using the create2 opcode with a unique salt, mints NFTs for the artist, and sets the AlbumCollectionAddress.
	/// Emits a WithdrawalCompleted event and an AlbumNFTMinted event upon successful execution.
	/// returns SFTCollectionAddress The address of the newly deployed SFTCollection contract.
	function withdraw() external returns(address SFTCollectionAddress) {

		if(sftDeployed) revert SFTAlreadyDeployed();
		if(msg.sender != artistAddress) revert OnlyArtistAllowed();
		if(totalDeposited < target) revert TargetNotReached();
    
    // Deploy a new SFTCollection contract using create2 opcode with a unique salt.
    bytes memory collectionBytecode = type(SFTCollection).creationCode;
    bytes32 salt = keccak256(abi.encodePacked(tracksQuantity));
		bytes memory deployData = abi.encodePacked(collectionBytecode, abi.encode(tracksQuantity));

		assembly {
			SFTCollectionAddress := create2(0, add(deployData, 0x20), mload(deployData), salt)
			if iszero(extcodesize(SFTCollectionAddress)) {
				revert(0, 0)
			}
		}
		
		// Set AlbumCollectionAddress and mint NFTs for the artist.
		AlbumCollectionAddress = SFTCollectionAddress;
    SFTCollection(AlbumCollectionAddress).mintNFTAlbum(artistAddress);
		sftDeployed = true;

    // Transfer the total deposited amount to the artist's address.
		myUSD.transfer(artistAddress, totalDeposited);
		
		// Emit a WithdrawalCompleted event.
		emit WithdrawalCompleted(artistAddress, totalDeposited);

		// Emit an AlbumNFTMinted event.
		emit AlbumNFTMinted(SFTCollectionAddress, artistAddress);
	}

	/// @notice Allows a contributor to request a refund if the campaign did not reach its funding target by the closing date.
	/// @dev This function checks if the total deposited amount is less than the target and if the campaign has ended.
	/// If both conditions are met, the function transfers the contributor's deposited amount back to them, emits a RefundCompleted event, and resets the contributor's balance to zero.
	function refund() external {

		if(totalDeposited >= target) revert TargetReached();
		if(block.timestamp <= closingDate) revert CampaignNotOverYet();

	    // Transfer the contributor's deposited amount back to them.
		myUSD.transfer(msg.sender, contributors[msg.sender]);

	    // Emit a RefundCompleted event.
		emit RefundCompleted(msg.sender, contributors[msg.sender]);

	    // Reset the contributor's balance to zero.
		contributors[msg.sender] = 0;
	}

	
	/// @notice Allows an investor to mint fractional NFT parts based on their contribution to the crowdfunding campaign.
	/// @dev This function checks if the SFTCollection contract has been deployed and if the investor has a non-zero contribution.
	/// If both conditions are met, the function calculates the amount of NFT parts proportional to the investor's contribution,
	/// mints the parts using the SFTCollection contract, resets the investor's contribution balance to zero, and emits an NFTsAttributed event.
	function mintPartsForInvestor() external {
		if(!sftDeployed) revert SFTNotDeployed();
		if(contributors[msg.sender] == 0) revert NothingToMint();

	    // Calculate the amount of NFT parts proportional to the investor's contribution.
		uint256 amountPerNFT = (contributors[msg.sender] * 1000) / totalDeposited;

		// Mint NFT parts using the SFTCollection contract.
        SFTCollection(AlbumCollectionAddress).mintParts(msg.sender, amountPerNFT);

	    // Emit an NFTsAttributed event.	
		emit NFTsAttributed(msg.sender, amountPerNFT);

	    // Reset the investor's contribution balance to zero.
    	contributors[msg.sender] = 0;

	}

	

}