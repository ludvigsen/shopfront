pragma solidity ^0.4.6;

import "./Owned.sol";

contract Killable is Owned {
  function kill() onlyOwner {
    selfdestruct(owner);
  }
}
