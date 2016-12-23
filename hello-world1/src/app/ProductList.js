import React, { Component } from 'react';
import ProductRow from './ProductRow';

class ProductList extends Component {
  render() {
    var rows = [];
    this.props.products.forEach((product) => {
      if (product.name.indexOf(this.props.filterText) === -1 || (!product.stocked && this.props.inStockOnly)) {
        return;
      }
      rows.push(<ProductRow product={product} key={product.name} />);
    });
    return (
        <div>
            {rows}
        </div>
    );
  }
}

export default ProductList;