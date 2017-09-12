pragma solidity ^0.4.11;

// import "./Killable.sol";
import "./Store.sol";

contract Hub is Killable {

  address[] public stores;

  mapping(address => bool) public storeExists;


  modifier onlyIfStore(address store) {
    require(storeExists[store]);
    _;
  }

  function getStoreCount()
    public
    constant
    returns (uint campaignCount)
  {
    return stores.length;
  }

  function createStore()
    public
    returns (address storeContract)
  {
    Store trustedStore = new Store(msg.sender);
    storeExists[trustedStore] = true;
    stores.push(trustedStore);
    return trustedStore;
  }

  function withdrawFromStore(address store)
    onlyOwner
    onlyIfStore(store)
    public
    returns (bool success)
  {
    Store trustedStore = Store(store);
    return(trustedStore.hubWithdraw());
  }

}
