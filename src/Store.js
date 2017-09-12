import React, { Component } from 'react';

export default class Store extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      contract: props.contract,
      web3: props.web3,
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
        this.updateState();
      });
    }

    if (this.state.web3 !== props.web3) {
      this.setState({
        web3: props.web3,
      });
    }
  }

  onBuy(p) {
    this.state.contract.purchase(p.id, 1, {from: this.state.customer, value: p.price, gas: 590000}).then(res => {
      this.updateState();
    });
  }

  updateState() {
    this.setState({
      products: [],
    });

    this.state.contract.merchantBalance.call({ from: this.state.owner }).then(balance => {
      this.setState({
        merchantBalance: balance && balance.toString(),
      });
    });

    this.state.contract.hubBalance.call({ from: this.state.owner }).then(balance => {
      this.setState({
        hubBalance: balance && balance.toString(),
      });
    });

    this.state.contract.getProductSize.call({ from: this.state.owner }).then(size => {
      if (size) {
        const length = Number(size.toString());
        this.getAllProducts(length, 0);
      }
    });


    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({
        owner: accounts[0],
        customer: accounts[5]
      });
    });
  }

  getAllProducts(length, i) {
    if (i >= length) {
      return;
    }
    this.state.contract.productIds.call(i, { from: this.state.owner }).then(id => {
      this.state.contract.products.call(id, { from: this.state.owner }).then(product => {
        const products = (this.state.products && [...this.state.products]) || [];
        products.push({
          id: Number(product[0].toString()),
          price: Number(product[1].toString()),
          stock: Number(product[2].toString()),
        });
        this.setState({
          products,
        });
        this.getAllProducts(length, i+1);
      });
    });
  }

  render () {
    return (
      <div>
        <h3>{this.props.name}</h3>
        <div>
        <span>Merchant balance: </span><span>{this.state.merchantBalance}</span>
        <span>Hub balance: </span><span>{this.state.hubBalance}</span>
        </div>
        <ul>
        { this.state.products && this.state.products.map((p,i) => (
            <li>
            <label>Id: </label><span>{p.id}</span>
            <label>Price: </label><span>{p.price}</span>
            <label>Stock: </label><span>{p.stock}</span>
            <button onClick={this.onBuy.bind(this, p)}>Buy</button>
            </li>
        )) }
        </ul>
      </div>
    );
  }
}
