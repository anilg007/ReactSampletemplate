import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route} from 'react-router';
import App from './app/App';
import ProductView from './app/ProductView';
import './index.css';
// import FilterableProductTable from './Product/FilterableProductTable';

// var initialData = {
//   "people": [{
//     "name": "Luke Skywalker",
//     "country": "https://swapi.co/api/people/1/"
//   }, {
//     "name": "Darth Vader",
//     "url": "https://swapi.co/api/people/4/"
//   }, {
//     "name": "Obi-wan Kenobi",
//     "url": "https://swapi.co/api/people/unknown/"
//   }, {
//     "name": "R2-D2",
//     "url": "https://swapi.co/api/people/2/"
//   }]
// };

ReactDOM.render(
 <Router>
        <Route path="/" component={App}/>
        <Route path="/Product" component={ProductView}/>
    </Router>,
  document.getElementById('root')
);

