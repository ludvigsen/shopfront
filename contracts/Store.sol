pragma solidity ^0.4.6;

import "./Killable.sol";

contract Store is Killable {

  address public merchant;

  uint public merchantBalance;
  uint public hubBalance;

  struct Product {
    uint id;
    uint price;
    uint stock;
  }

  struct Purchase {
    uint id;
    uint amount;
    address buyer;
  }

  modifier onlyMerchant {
    require(msg.sender == merchant);
    _;
  }

  mapping(uint => Product) public products;

  uint[] public productIds;

  Purchase[] public purchases;

  function Store(address _merchant) {
    merchant = _merchant;
  }

  function addProduct(uint _id, uint _price, uint _stock)
    onlyMerchant
    returns (bool)
  {
    require(products[_id].id == 0);
    products[_id] = Product(_id, _price, _stock);
    productIds.push(_id);
    return true;
  }

  function getProductSize() returns (uint) {
    return productIds.length;
  }

  function purchase(uint _id, uint amount)
    payable
    returns (bool)
  {
    require(products[_id].price * amount == msg.value);
    require(products[_id].stock >= amount);

    uint hubCut = msg.value / 20;
    merchantBalance += msg.value - hubCut;
    hubBalance += hubCut;

    products[_id].stock = products[_id].stock - amount;
    purchases.push(Purchase(_id, amount, msg.sender));
    return true;
  }

  function withdraw()
    onlyMerchant
    returns (bool)
  {
    uint amount = merchantBalance;
    merchantBalance = 0;
    merchant.transfer(amount);
    return true;
  }

  function hubWithdraw()
    onlyOwner
    returns (bool)
  {
    uint amount = hubBalance;
    hubBalance = 0;
    owner.transfer(amount);
    return true;
  }
}
