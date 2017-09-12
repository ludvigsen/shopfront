// This would be stored in a regular database instead of local storage
// But I use localStorage here for simplicity

const STORES = 'STORES';

export function addStore(store) {
  const stores = JSON.parse(localStorage.getItem(STORES)) || {};
  stores[store.address] = store;
  // stores.push(store);
  localStorage.setItem(STORES, JSON.stringify(stores));
}

export function getStores() {
  return JSON.parse(localStorage.getItem(STORES));
}

export function getStore(address) {
  return getStores()[address];
}

export function addProduct(storeAddress, product) {
  const stores = getStores();
  const store = stores[storeAddress];
  if (!store.products) {
    store.products = {};
  }
  store.products[product.id] = product;
  stores[storeAddress] = store;
  localStorage.setItem(STORES, JSON.stringify(stores));
}

export function getProduct(storeAddress, productId) {
  return getStore(storeAddress).products[productId];
}
