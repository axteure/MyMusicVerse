// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;
 
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "./SFTCollection.sol";


contract Crowdfunding {

	IERC20 public myUSD;

	mapping(address => uint32) public contributors;

	address public artistAddress;

    uint32 public target;
    uint32 public totalDeposited;
    uint256 public startingDate;
    uint256 public closingDate;
    string public title;
    bool public isOpened = true;

	address public AlbumCollectionAddress;
    bool public sftDeployed = false;

    uint8 public tracksQuantity;

	event DepositReceived(address sender, uint32 amount);
	event WithdrawalCompleted(address artistAddress, uint32 amount);
	event AlbumNFTMinted(address SFTCollectionAddress,address artistAddress);
	event RefundCompleted(address contributor, uint32 amount);
	event NFTsAttributed(address contributor, uint amount);


	error CampaignNotOverYet();
	error AmountExceedsLimit();
	error TotalDepositExceedsLimit();
	error InsufficientAllowance();
	error OnlyArtistAllowed();
	error TargetNotReached();
	error TargetReached();
	error SFTNotDeployed();
	error NothingToMint();
 
	constructor(address _MyUSDAddress, address _artistAddress, uint32 _target, string memory _title, uint8 _tracksQuantity) {

		myUSD = IERC20(_MyUSDAddress);

		artistAddress = _artistAddress;
		target = _target;
        startingDate = block.timestamp;
        closingDate = block.timestamp + 30 days;
    	title = _title;
		tracksQuantity = _tracksQuantity;
	}

	function deposit(uint32 _amount) external {
		//require(block.timestamp < closingDate, "Campaign is closed.");
		//require(isOpened, "Campaign is closed.");
    	//require(_amount <= target, "Amount exceeds the campaign limit.");
		//require(totalDeposited + _amount <= target, "Total deposit exceeds the campaign limit.");
		//require(myUSD.allowance(msg.sender, address(this)) >= _amount, "The allowance is not enough do to this transfer.");

		if(block.timestamp > closingDate) revert CampaignNotOverYet();
		if(!isOpened) revert CampaignNotOverYet();
    	if(_amount > target) revert AmountExceedsLimit();
		if(totalDeposited + _amount > target) revert TotalDepositExceedsLimit();
		if(myUSD.allowance(msg.sender, address(this)) < _amount) revert InsufficientAllowance();

		myUSD.transferFrom(msg.sender, address(this), _amount);

		totalDeposited += _amount;

		contributors[msg.sender] += uint32(_amount);

		if (totalDeposited >= target) {
			isOpened = false;
		}

		emit DepositReceived(msg.sender, _amount);
	}

	function withdraw() external returns(address SFTCollectionAddress) {
		//require(msg.sender == artistAddress, "Only the artist can withdraw the funds.");
		//require(totalDeposited >= target, "The target is not reached.");

		if(msg.sender != artistAddress) revert OnlyArtistAllowed();
		if(totalDeposited < target) revert TargetNotReached();

		myUSD.transfer(artistAddress, totalDeposited);
		
		emit WithdrawalCompleted(artistAddress, totalDeposited);

		bytes memory collectionBytecode = type(SFTCollection).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(tracksQuantity));
		bytes memory deployData = abi.encodePacked(collectionBytecode, abi.encode(tracksQuantity));

		assembly {
			SFTCollectionAddress := create2(0, add(deployData, 0x20), mload(deployData), salt)
			if iszero(extcodesize(SFTCollectionAddress)) {
				revert(0, 0)
			}
		}
		
		AlbumCollectionAddress = SFTCollectionAddress;
        SFTCollection(AlbumCollectionAddress).mintNFTAlbum(artistAddress);
		sftDeployed = true;

		emit AlbumNFTMinted(SFTCollectionAddress, artistAddress);
	}

	function refund() external {
		//require(totalDeposited < target, "The target has been reached, you can not be refunded.");
		//require(block.timestamp > closingDate, "The campaign is not over yet, you can not be refunded.");

		if(totalDeposited >= target) revert TargetReached();
		if(block.timestamp <= closingDate) revert CampaignNotOverYet();

		myUSD.transfer(msg.sender, contributors[msg.sender]);

		emit RefundCompleted(msg.sender, contributors[msg.sender]);

		contributors[msg.sender] = 0;
	}

	

	function mintPartsForInvestor() external {
		if(!sftDeployed) revert SFTNotDeployed();
		if(contributors[msg.sender] == 0) revert NothingToMint();

		uint256 amountPerNFT = (contributors[msg.sender] * 1000) / totalDeposited;
        SFTCollection(AlbumCollectionAddress).mintParts(msg.sender, amountPerNFT);

    	contributors[msg.sender] = 0;

		emit NFTsAttributed(msg.sender, 100);
	}

	

}