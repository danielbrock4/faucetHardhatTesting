//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;


contract Faucet {
    address payable public owner;
    
    constructor() payable {
        owner = payable(msg.sender);
    }

    event FallbackCalled(address);

    function withdraw(uint _amount) payable public {
        // ‘require’ returns two boolean values that are either true or false, if the specified condition returns a true value it allows the code to flow and function accordingly. If the value returned is false, it throws an error and stops the code right there
        // users can only withdraw .1 ETH at a time, feel free to change this!
        require(_amount <= 100000000000000000);
        payable(msg.sender).transfer(_amount);
    }

    function withdrawAll() onlyOwner public {
        owner.transfer(address(this).balance);
    }

    function destoryFaucet() onlyOwner public {
        selfdestruct(owner);
    }

    //  function will be invoked if msg contains no data
    fallback() external payable {
        emit FallbackCalled(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}