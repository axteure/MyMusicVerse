// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.20;
 
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
 
contract MyUSD is ERC20 {

	event MUSDMinted(address recipient, uint amount);

	constructor() ERC20('USD Stablecoin', 'MUSD') {} 

	// Faucet function to create MUSD tokens
	function faucet(address _recipient, uint _amount) external {
		_mint(_recipient, _amount);

		emit MUSDMinted(_recipient, _amount);
	}
}
