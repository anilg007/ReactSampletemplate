import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import StoreItem from './StoreItem.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to STORE</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <StoreItem></StoreItem>
         <StoreItem></StoreItem>
      </div>
    );
  }
}

export default App;
