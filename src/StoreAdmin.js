import React, { Component } from 'react';
import Store from '../build/contracts/Store.json';
import * as DB from './DB';

export default class StoreAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storageValue: 0,
      web3: props.web3,
      contract: props.contract,
    };
    this.onIdChange = this.onIdChange.bind(this);
    this.onPriceChange = this.onPriceChange.bind(this);
    this.onStockChange = this.onStockChange.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.onWithdraw = this.onWithdraw.bind(this);
  }

  componentDidMount () {
    if (this.state.contract) {
      this.updateState();
    }
  }

  componentWillReceiveProps(props) {
    if (this.state.contract !== props.contract) {
      this.setState({
        contract: props.contract,
      }, () => {
        this.updateState();
      });
    }

    if (this.state.web3 !== props.web3) {
      this.setState({
        web3: props.web3,
      });
    }
  }

  onWithdraw(e) {
    this.state.contract.withdraw({ from: this.props.merchant }).then(res => {
      this.updateState();
    });
  }

  onIdChange(e) {
    this.setState({
      id: e.target.value,
    });
  }

  onPriceChange(e) {
    this.setState({
      price: e.target.value,
    });
  }

  onStockChange(e) {
    this.setState({
      stock: e.target.value,
    });
  }

  onNameChange = (e) => {
    this.setState({
      name: e.target.value,
    })
  }

  getAllProducts(length, i) {
    if (i >= length) {
      return;
    }
    this.state.contract.productIds.call(i, { from: this.state.owner }).then(id => {
      this.state.contract.products.call(id, { from: this.state.owner }).then(product => {
        const products = (this.state.products && [...this.state.products]) || [];
        const prod = DB.getProduct(this.props.store.address, Number(product[0].toString()));
        products.push({
          id: Number(product[0].toString()),
          price: Number(product[1].toString()),
          stock: Number(product[2].toString()),
          name: prod && prod.name
        });
        this.setState({
          products,
        });
        this.getAllProducts(length, i+1);
      });
    });
  }

  updateState() {
    this.setState({
      products: [],
      purchases: [],
    });
    this.state.contract.getProductSize.call({ from: this.state.owner }).then(size => {
      if (size) {
        const length = Number(size.toString());
        this.getAllProducts(length, 0);
      }
    });

    this.state.web3.eth.getBalancePromise(this.state.owner).then(ownerBalance => {
      this.setState({
        ownerBalance,
      });
    });

    this.state.web3.eth.getBalancePromise(this.state.customer).then(customerBalance => {
      this.setState({
        customerBalance,
      });
    });
    this.state.web3.eth.getBalancePromise(this.props.merchant).then(merchantBalance => {
      this.setState({
        merchantBalance,
      });
    });
  }

  onAdd(e) {
    this.state.contract.addProduct(this.state.id, this.state.price, this.state.stock, {from: this.props.merchant}).then((res) => {
      DB.addProduct(this.props.store.address, {
        id: Number(this.state.id),
        price: Number(this.state.price),
        stock: Number(this.state.stock),
        name: this.state.name,
      });
      this.updateState();
    });
  }

  render() {
    return (
      <div>
        <h3>{this.props.store.name}</h3>
        <span>{this.state.merchantBalance && this.state.merchantBalance.toString()}</span>
        <div className="pure-u-1-1">
          <div>
            <label htmlFor="id">Id:</label>
            <input id="id" onChange={this.onIdChange} type="number" />
          </div>
          <div>
            <label htmlFor="price">Price:</label>
            <input id="price" onChange={this.onPriceChange} type="number" />
          </div>
          <div>
            <label htmlFor="stock">Stock:</label>
            <input id="stock" onChange={this.onStockChange} type="number" />
          </div>
          <div>
            <label htmlFor="name">Name:</label>
            <input id="name" onChange={this.onNameChange} type="text" />
          </div>
          <div>
            <button onClick={this.onAdd}>Add</button>
            <button onClick={this.onWithdraw}>Withdraw</button>
          </div>
        </div>
        <div className="pure-u-1-1">
          <ul>
            { this.state.products && this.state.products.map((p,i) => (
              <li key={i}>
                <label>Name: </label><span>{p.name}</span>
                <label>Id: </label><span>{p.id}</span>
                <label>Price: </label><span>{p.price}</span>
                <label>Stock: </label><span>{p.stock}</span>
              </li>
            )) }
          </ul>
        </div>
      </div>
    );
  }

}
