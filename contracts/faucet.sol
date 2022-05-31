//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;


contract Faucet {
    address payable public owner;
    
    constructor() payable {
        owner = payable(msg.sender);
    }

    event FallbackCalled(address);

    function withdraw(uint _amount) payable public {
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