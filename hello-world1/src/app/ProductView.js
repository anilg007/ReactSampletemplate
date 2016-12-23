import React, { Component } from 'react';

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

class ProductView extends Component {

  render() {
    return (
      <div className="card" style={card}>
      <img src="http://www.w3schools.com/howto/img_avatar.png" alt={this.props.product.name}></img>
        <div className="container" style={container}>
          <h3>{this.props.product.name}</h3>
          <h4>{this.props.product.price}</h4>
        </div>
      </div>
    );
  }
}
export default ProductView;