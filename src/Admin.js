import React, { Component } from 'react';
import Store from '../build/contracts/Store.json';
import StoreAdmin from './StoreAdmin';

import * as DB from './DB';

export default class Admin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storageValue: 0,
      web3: props.web3,
      contract: props.contract,
      accounts: props.accounts || [],
      owner: props.accounts ? props.accounts[0] : null,
      merchant: props.accounts? props.accounts[0] : null,
      stores: [],
      provider: props.provider,
    };
  }

  componentDidMount() {
    if (this.props.contract) {
      this.updateState();
    }
  }


  componentWillReceiveProps(props) {
    if (this.state.contract !== props.contract
        || this.state.web3 !== props.web3
        || this.state.accounts !== props.accounts
        || this.state.provider !== props.provider) {
      this.setState({
        contract: props.contract,
        web3: props.web3,
        accounts: props.accounts,
        owner: props.accounts ? props.accounts[0] : null,
        merchant: props.accounts? props.accounts[0] : null,
        provider: props.provider,
      }, () => {
        if (this.state.contract && this.state.contract.address){
          this.updateState();
        }
      });
    }
  }

  updateState() {
    this.setState({
      stores: [],
    });
    this.state.contract.getStoreCount.call({ from: this.state.owner }).then(size => {
      if (size) {
        const length = Number(size.toString());
        this.getAllStores(0, length);
      }
    });
  }

  getAllStores(i, length) {
    if(i < length) {
      this.state.contract.stores.call(i, { from: this.state.owner }).then(store => {
        const truffleContract = require('truffle-contract');
        const storeContract = truffleContract(Store);
        storeContract.setProvider(this.state.provider);
        const savedStore = DB.getStore(store);
        const newStore = storeContract.at(store).then(sc => {

          const s = {
            contract: sc,
            name: savedStore ? savedStore.name : 'Undefined',
            merchant: savedStore ? savedStore.merchant : null,
            address: store,
          };
          this.setState({
            stores: [...this.state.stores, s],
          }, () => {
            this.getAllStores(i + 1, length);
          });
        });
      });
    }
  }

  onSelectAccount = (e) => {
    this.setState({
      merchant: e.target.value,
    });
  }

  addStore = () => {
    this.state.contract.createStore({ from: this.state.merchant, gas: 910000 }).then(res => {

      this.state.contract.getStoreCount.call({ from: this.state.owner }).then(size => {
        const length = Number(size.toString());
        this.state.contract.stores.call(length - 1, { from: this.state.owner }).then(store => {
          DB.addStore({
            address: store,
            name: this.state.storeName,
            merchant: this.state.merchant,
          });
          this.updateState();
        });


      });
    });
  }

  onStoreNameChange = (e) => {
    this.setState({
      storeName: e.target.value,
    });
  }

  onWithdraw = () => {
    Promise.all(this.state.stores.map((s) => {
      return s.contract.hubBalance.call({ from: this.state.owner }).then((balance) => {
        if (Number(balance.toString()) > 0) {
          return this.state.contract.withdrawFromStore(s.address, { from: this.state.owner }).then(res => {
            return res;
          });
        }
        return null;
      });
    })).then(() => {
      this.updateState();
    });
  }

  render () {
    return (
      <div>
        <div>
          <button onClick={this.onWithdraw}>Withdraw</button>
        </div>
          <select onChange={this.onSelectAccount}>
            { this.state.accounts && this.state.accounts.map(a => (<option>{a}</option>)) }
          </select>
          <input placeholder="Store name" type="text" onChange={this.onStoreNameChange} />
          <button onClick={this.addStore}>Add store </button>
          { this.state.stores && this.state.stores
            .map((s, i) => (<StoreAdmin merchant={s.merchant} key={i} contract={s.contract} store={s} web3={this.state.web3} />)) }
        </div>
    );
  }
}
