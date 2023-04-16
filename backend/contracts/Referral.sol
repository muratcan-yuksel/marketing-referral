// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

//import hardhat console log
import "hardhat/console.sol";

contract Referral is ReentrancyGuard {
    using SafeMath for uint256;
    struct User {
        address referrer;
        uint8 totalReferrals;
        uint8 level;
        // uint256 totalReferralEarnings;
    }

    address public owner;
    mapping(address => User) public users;

    uint256 public constant REGISTRATION_FEE = 0.25 ether;
    uint8 public constant REFERRAL_PERCENTAGE = 70;
    uint8 public constant BONUS_REFERRALS = 3;
    uint8 public constant BONUS_PERCENTAGE = 50;

    constructor() {
        owner = msg.sender;
        User storage firstUser = users[owner];
        firstUser.referrer = address(0);
        firstUser.totalReferrals = 0;
        firstUser.level = 1;
    }

    modifier validRegistration(address _referrer) {
        require(
            msg.value == REGISTRATION_FEE,
            "Registration fee is 0.25 ether"
        );
        require(
            users[msg.sender].referrer == address(0),
            "User already registered"
        );
        require(
            _referrer != address(0) && _referrer != msg.sender,
            "Invalid referrer"
        );
        if (_referrer != owner) {
            require(
                users[_referrer].referrer != address(0),
                "Referrer does not exist"
            );
        }
        require(
            users[_referrer].referrer != msg.sender,
            "Referrer cannot be the sender"
        );
        _;
    }

    function register(
        address _referrer
    ) public payable validRegistration(_referrer) {
        User storage newUser = users[msg.sender];
        newUser.referrer = _referrer;
        newUser.totalReferrals = 0;
        newUser.level = 1;

        console.log("User registered: %s", msg.sender);
        console.log("Referrer: %s", _referrer);
        console.log(msg.value);

        transferPayment(_referrer, msg.value);
        updateReferralCount(_referrer);
    }

    function transferPayment(address _referrer, uint256 _amount) private {
        uint256 referralAmount = (_amount * REFERRAL_PERCENTAGE) / 100;
        uint256 businessAmount = _amount - referralAmount;
        if (users[_referrer].totalReferrals % BONUS_REFERRALS == 0) {
            referralAmount = (_amount * BONUS_PERCENTAGE) / 100;
            businessAmount = _amount - referralAmount;
        }
        payable(_referrer).transfer(referralAmount);
        //business amount should be sent to the owner

        payable(owner).transfer(businessAmount);
    }

    function updateReferralCount(address _referrer) private {
        users[_referrer].totalReferrals++;
    }

    //if the user has referred 9 people, they can call this function to pay 0.5 eth to the contract and level up
    function levelUp(address _user) public payable {
        //require that the user has referred 9 people
        require(
            users[_user].totalReferrals % 9 == 0,
            "User has not referred 9 people"
        );
        //require that the user has paid 0.5 eth to the contract
        require(msg.value == 0.5 ether, "User has not paid 0.5 ether");
        //require that the user is less than 9 levels
        require(users[_user].level < 10, "User is already at level 10");
        //update the user's level
        users[_user].level++;
    }

    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }

    fallback() external payable {
        revert("Invalid function call");
    }

    receive() external payable {
        revert("Received ether without a function call");
    }
}
