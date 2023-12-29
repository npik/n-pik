// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
//    constructor(uint256 initialSupply) ERC20("Gold", "hUSDb") {
//        _mint(msg.sender, initialSupply);
//    }
    //constructor() ERC20("Beyond AAPL Token", "hAAPLb") {
    //    _mint(msg.sender, 100000000000000000000000000);
    //}
    constructor(string memory name_, string memory symbol_, uint256 initialSupply) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply);
    }
}
