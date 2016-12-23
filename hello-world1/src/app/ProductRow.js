import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ProductView from './ProductView';

const card =  {
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    transition: '0.3s',
    width: '40%',
};

const card_hover =  {
    boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
};

const container =  {
    padding: '2px 16px',
};

class ProductRow extends Component {
  constructor() {
    super();
    this.state = {
     firstTime:true
    };
  }
  change(event){
    var x = event.target;
    this.state.firstTime==true ? ReactDOM.render(<ProductView product={this.props.product} />,document.getElementById('root')) : console.log("oh well");
    this.setState({firstTime: false});
  };
  render() {
    return (
      <div  onClick={this.change} className="card" style={card}>
      <img src="http://www.w3schools.com/howto/img_avatar.png" alt={this.props.product.name}></img>
        <div className="container" style={container}>
          <h3>{this.props.product.name}</h3>
          <h4>{this.props.product.price}</h4>
        </div>
      </div>
    );
  }
}
export default ProductRow;