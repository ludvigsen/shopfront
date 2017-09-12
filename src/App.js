import React, { Component } from 'react';
// import StoreContract from '../build/contracts/Store.json';
import getWeb3 from './utils/getWeb3';
import Admin from './Admin';
import Stores from './Stores';
import Hub from '../build/contracts/Hub.json';
import Promise from 'bluebird';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storageValue: 0,
      web3: null,
      view: 'admin',
    };
  }

  adminSelected = () => {
    this.setState({
      view: 'admin',
    });
  }

  storeSelected = () => {
    this.setState({
      view: 'store',
    });
  }

  onBuy(p) {
    this.state.contract.purchase(p.id, 1, {from: this.state.customer, value: p.price}).then(res => {
      this.updateState();
    });
  }

  updateState() {
    this.setState({
      products: [],
      purchases: [],
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
    this.state.web3.eth.getBalancePromise(this.state.contract.address).then(contractBalance => {
      this.setState({
        contractBalance,
      });
    });

    this.getPurchases(0);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        Promise.promisifyAll(results.web3.eth, { suffix: "Promise" });
        this.setState({
          web3: results.web3
        }, () => this.instantiateContract());
      })
      .catch((e) => {
        console.log(e);
        console.log('Error finding web3.');
      });
  }

  instantiateContract() {
    const contract = require('truffle-contract');

    const hub = contract(Hub);
    const provider = new this.state.web3.providers.HttpProvider('http://localhost:8545');
    hub.setProvider(provider);

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      hub.deployed().then(instance => {
        localStorage.setItem('contract', instance.address);
        this.setState({
          accounts,
          owner: accounts[0],
          customer: accounts[1],
          contract: instance,
          provider,
        }, () => this.updateState());
      });
    });
  }

  render() {
    let component;
    switch(this.state.view) {
    case 'admin':
      component = (<Admin provider={this.state.provider} accounts={this.state.accounts} contract={this.state.contract} web3={this.state.web3} />);
      break;
    case 'store':
      component = (<Stores provider={this.state.provider} contract={this.state.contract} web3={this.state.web3} />);
      break;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link" onClick={this.adminSelected}>Admin</a>
          <a href="#" className="pure-menu-heading pure-menu-link" onClick={this.storeSelected}>Store</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <div>
                <span>Admin: </span><span>{this.state.ownerBalance && this.state.ownerBalance.toString()}</span>
                <span>Customer: </span><span>{this.state.customerBalance && this.state.customerBalance.toString()}</span>
                <span>Contract: </span><span>{this.state.contractBalance && this.state.contractBalance.toString()}</span>
              </div>
            </div>
            <div className="pure-u-1-1">
              {component}
            </div>
            <div className="pure-u-1-1">

        <ul>
        { this.state.purchases && this.state.purchases.map((p,i) => (
          <li>
            <label>Id: </label><span>{p.id}</span>
            <label>Amount: </label><span>{p.amount}</span>
            <label>Buyer: </label><span>{p.address}</span>
          </li>
        )) }
      </ul>
        </div>
        </div>
        </main>
        </div>
    );
  }
}

export default App;
