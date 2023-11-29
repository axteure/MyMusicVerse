// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;
 
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
 
contract MyUSD is ERC20 {
	constructor() ERC20('USD Stablecoin', 'MUSD') {} 

	// Faucet function to create MUSD tokens
	function faucet(address recipient, uint amount) external {
		_mint(recipient, amount);
	}
}
