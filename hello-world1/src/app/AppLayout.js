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



var AppLayout = function AppLayout(_ref10) {
  var empty = _ref10.empty;
  var characters = _ref10.characters;
  var onCharacterSelected = _ref10.onCharacterSelected;

  var props = _objectWithoutProperties(_ref10, ["empty", "characters", "onCharacterSelected"]);

  return React.createElement(
    "div",
    { className: "ui container" },
    React.createElement(
      "h1",
      null,
      "Star Wars Characters"
    ),
    React.createElement(CharacterMenu, {
      characters: characters,
      onCharacterSelected: onCharacterSelected }),
    empty ? React.createElement(IconMessage, { icon: "home", variant: "", header: "Welcome", message: "Please select a character from the menu" }) : React.createElement(SelectedCharacterView, props)
  );
};