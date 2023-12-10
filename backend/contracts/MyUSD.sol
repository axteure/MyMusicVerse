// SPDX-License-Identifier: GPL-3.0

/// @title MyUSD - ERC20 Stablecoin Contract
/// @author Clément HANQUIEZ
/// @notice This contract defines the MyUSD ERC20 stablecoin with a faucet function for minting new tokens.
/// @dev This contract is based on the OpenZeppelin ERC20 implementation.

pragma solidity 0.8.20;
 
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
 
contract MyUSD is ERC20 {

	/// @dev Emitted when new MUSD tokens are minted and assigned to a recipient.
    /// @param recipient The address receiving the minted MUSD tokens.
    /// @param amount The amount of MUSD tokens minted.
	event MUSDMinted(address recipient, uint amount);

	/// @dev Constructs the MyUSD ERC20 contract, initializing the name and symbol.
	constructor() ERC20('USD Stablecoin', 'MUSD') {} 

	/// @notice Allows users to obtain MUSD tokens by calling this function.
    /// @param _recipient The address that will receive the minted MUSD tokens.
    /// @param _amount The amount of MUSD tokens to mint.
    /// @dev The function checks that the amount to create is greater than 1, otherwise, it reverts.
	function faucet(address _recipient, uint _amount) external {
		require(_amount > 1, "You can mint more than 1.");

        // Mint the specified amount of MUSD and assign it to the recipient.
		_mint(_recipient, _amount);

        // Emit the MUSDMinted event to log the creation of new MUSD tokens.
		emit MUSDMinted(_recipient, _amount);
	}
	
}
