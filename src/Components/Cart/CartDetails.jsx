import React, {useContext} from 'react'
import { ShopContext } from '../ShopContext/ShopContext'
import { FiTrash2 } from 'react-icons/fi';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';


const CartDetails = ({item}) => {
    const {removeFromCart, increaseAmount, decreaseAmount} = useContext(ShopContext);

    const { id, name, image, price, amount} = item;

  return (
    <div>
        <div className="cart_item">
            <div className="product_detail_container">
                <img src={image} alt="" />
                <div className="product_info">
                    <h3>{name} </h3>
                    <div className="cart_item_remove" onClick={()=> removeFromCart(id)}>
                        <FiTrash2 /> Remove
                    </div>
                </div>
            </div>
            <div className="quantity">
                <button onClick={()=> decreaseAmount(id)}>
                    <IoMdRemove />
                </button>
                <span>{amount} </span>
                <button onClick={()=> increaseAmount(id)}>
                    <IoMdAdd />
                </button>
            </div>
            <div className="price"> ${price}</div>
            <div className="total">{`$ ${parseFloat(price * amount).toFixed(2)}`} </div>
        </div>
    </div>
  )
}

export default CartDetails