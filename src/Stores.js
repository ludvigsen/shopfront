import React, { Component } from 'react';
import StoreContract from '../build/contracts/Store.json';
import Store from './Store';
import * as DB from './DB';

export default class Stores extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      products: [],
      contract: props.contract,
      web3: props.web3,
      provider: props.provider,
    };
  }

  componentDidMount() {
    if (this.props.contract) {
      this.updateState();
    }
  }

  componentWillReceiveProps(props) {
    if (this.state.contract !== props.contract) {
      this.setState({
        contract: props.contract,
      }, () => {
        console.log('updateState');
        this.updateState();
      });
    }

    if (this.state.web3 !== props.web3) {
      this.setState({
        web3: props.web3,
      });
    }

    if (this.state.provider !== props.provider) {
      this.setState({
        provider: props.provider,
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
        const storeContract = truffleContract(StoreContract);
        storeContract.setProvider(this.state.provider);
        const newStore = storeContract.at(store).then(sc => {
          const s = {
            contract: sc,
            name: DB.getStore(store) ? DB.getStore(store).name : 'Undefined',
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

  render() {

    return (
      <ul>
        { this.state.stores && this.state.stores.map(store =>
          (<li><Store web3={this.state.web3} contract={store.contract} name={store.name} /></li>)
        )}
      </ul>
    );
  }
}
