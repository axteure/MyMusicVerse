// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;
 
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Crowdfunding {

	IERC20 myUSD;

	mapping(address => uint32) public contributors;

	address public artistAddress;
	uint32 public target;
	uint32 public totalDeposited;
	uint256 public startingDate;
    uint256 public closingDate;
    string public title;
	bool public isOpened = true;

	event DepositReceived(address sender, uint32 amount);
	event WithdrawalCompleted(address artistAddress, uint32 amount);
	event RefundCompleted(address contributor, uint32 amount);
 
	constructor(address _MyUSDAddress, address _artistAddress, uint32 _target, string memory _title) {

		myUSD = IERC20(_MyUSDAddress);

		artistAddress = _artistAddress;
		target = _target;
        startingDate = block.timestamp;
        closingDate = block.timestamp + 30 days;
    	title = _title;
	}

	function deposit(uint32 _amount) external {
		require(block.timestamp < closingDate, "Campaign is closed.");
		require(isOpened, "Campaign is closed.");
    	require(_amount <= target, "Amount exceeds the campaign limit.");
		require(totalDeposited + _amount <= target, "Total deposit exceeds the campaign limit.");
		require(myUSD.allowance(msg.sender, address(this)) >= _amount, "The allowance is not enough do to this transfer.");

		myUSD.transferFrom(msg.sender, address(this), _amount);

		totalDeposited += _amount;

		contributors[msg.sender] += uint32(_amount);

		if (totalDeposited >= target) {
			isOpened = false;
		}

		emit DepositReceived(msg.sender, _amount);
	}

	function withdraw() external {
		require(msg.sender == artistAddress, "Only the artist can withdraw the funds.");
		require(totalDeposited >= target, "The target is not reached.");

		myUSD.transfer(artistAddress, totalDeposited);

		emit WithdrawalCompleted(artistAddress, totalDeposited);
	}

	function refund() external {
		require(totalDeposited < target, "The target has been reached, you can not be refunded.");
		require(block.timestamp > closingDate, "The campaign is not over yet, you can not be refunded.");

		myUSD.transfer(msg.sender, contributors[msg.sender]);

		emit RefundCompleted(msg.sender, contributors[msg.sender]);

		contributors[msg.sender] = 0;
	}

}