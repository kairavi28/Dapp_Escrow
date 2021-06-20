//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
//https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol

contract Escrow is AccessControl{
    //escrow agent
    address payable public buyer;
    address payable public seller;

    enum State{ AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE }
    State public state;
    
    mapping(address => uint) public deposits;
    
    //declaring variables --over here
    bytes32 public constant AGENT = keccak256("AGENT");
    bytes32 public constant BUYER = keccak256("BUYER");
    bytes32 public constant SELLER = keccak256("SELLER"); 
    //state 
    modifier inState(State expected_state){
        require(state == expected_state);
        _;
    }
    //check RBAC for agent
    modifier onlyAgent() {
        require(hasRole(AGENT, msg.sender), "Only agent or owner can call this method");
        _;
    }

    //buyer
    modifier onlyBuyer(){
        require(msg.sender == buyer, "Only buyer can call this method");
        _;
    }
    //seller
    modifier onlySeller(){
        require(msg.sender == seller,"Only seller can call this method");
        _;
    }
    //constructor
    constructor(address payable _buyer, address payable _seller) { 
        _setupRole(AGENT, msg.sender);
        buyer = _buyer;
        seller = _seller;
        _setupRole(BUYER, buyer);
        _setupRole(SELLER, seller);
        state = State.AWAITING_PAYMENT;
    }
    //buyer deposits funds to contract
    function deposit() public onlyBuyer payable{
        require(state == State.AWAITING_PAYMENT, "Already Paid");
        state = State.AWAITING_DELIVERY;
        deposits[buyer] += msg.value;
    }
    //function to confirm the payment 
    function confirmPayment() inState(State.AWAITING_PAYMENT) public onlyBuyer payable{
        state = State.COMPLETE;
    }
    //agent releases payment to seller -- true
    function confirmDelivery() onlyAgent inState(State.AWAITING_DELIVERY) public{
        uint256 payment = deposits[buyer];
        deposits[buyer] = 0;
        seller.transfer(payment);
        state = State.COMPLETE;
    }
    //agent releases payment to buyer -- false
    //return payment to buyer
    function returnPayment() onlyAgent inState(State.AWAITING_DELIVERY) public{
        uint256 payment = deposits[buyer];
        deposits[buyer] = 0;
        buyer.transfer(payment);
        state = State.COMPLETE;
    }
}
