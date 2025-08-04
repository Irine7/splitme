// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExpenseToken is ERC20, Ownable {
    constructor() ERC20("SplitMe Token", "SPLIT") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function faucet() external {
        require(balanceOf(msg.sender) < 1000 * 10**decimals(), "Already has tokens");
        _mint(msg.sender, 100 * 10**decimals());
    }
}