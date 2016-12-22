import React, { Component } from 'react';

class StoreItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Id:0,
            ItemImage:"",
            ItemName:"",
            ItemPrice:"",
            ItemDescription:""
        };
    }
    componentDidMount() {
        this.setState({Id:0,
            ItemImage:"http://i.istockimg.com/file_thumbview_approve/36248396/5/stock-photo-36248396-blackened-cajun-sea-bass.jpg",
            ItemName:"Pacific Halibut",
            ItemPrice:"17.24",
            ItemDescription:"Everyones favorite white fish. We will cut it to the size you need and ship it."
        });
    }
    render() {
        return (
        <div className="StoreItem">
            <li className="menu-item">
                <img src={this.state.ItemImage} alt={this.state.ItemName}></img>
                <h3 className="item-name">
                    {this.state.ItemName}
                    <span className="price">${this.state.ItemPrice}</span>
                </h3>
                <p>{this.state.ItemDescription}</p>
                <button>Add To Order</button>
            </li>
        </div>
        );
    }
}

export default StoreItem;
