import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { Link } from "react-router-dom";
import { backend_url } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/actions/cart";
import Swal from "sweetalert2";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);

  const dispatch = useDispatch();

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0,
  );

  const quantityChangeHandler = (data) => {
    dispatch(addToCart(data));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
      <div className="fixed top-0 right-0 min-h-full w-[25%] bg-white flex flex-col justify-between shadow-sm">
        {
          cart && cart.length === 0 ? (
             <div className="w-full h-screen flex items-center justify-center">
              <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
                <RxCross1
              size={25}
              className="cursor-pointer"
              onClick={() => setOpenCart(false)}
            />
              </div>
              <h5 className="text-2xl">Cart is Empty!</h5>
             </div>
          ) : (
            <>
            <div>
          <div className="flex w-full justify-end pt-5 pr-5">
            <RxCross1
              size={20}
              className="cursor-pointer"
              onClick={() => setOpenCart(false)}
            />
          </div>
          {/* Heading */}
          <div className="flex items-center p-3">
            <IoBagHandleOutline size={20} />
            <h5 className="pl-2 text-[20px] font-[500]">{cart && cart.length} Items</h5>
          </div>
          {/* cart single items */}
          <br />
          <div className="w-full border-t">
            {cart &&
              cart.map((i, index) => (
                <CartSingle
                  key={index}
                  data={i}
                  quantityChangeHandler={quantityChangeHandler}
                  removeFromCartHandler={removeFromCartHandler}
                />
              ))}
          </div>
        </div>
        {/* Checkout Button */}
        <div className="px-5 mb-3">
          <Link to="/checkout">
            <div className="h-[45px] flex items-center justify-center bg-[#e44343] w-full rounded-md">
              <h1 className="text-white text-[15px] font-semibold">
                Checkout Now (USD${totalPrice})
              </h1>
            </div>
          </Link>
        </div>
            </>
          )
        }
      </div>
    </div>
  );
};

const CartSingle = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);
  const totalPrice = data.discountPrice * value;

  const increment = (data) => {
    if (data.stock < value) {
      Swal.fire({
        icon: "warning",
        title: "Stock Limited",
        text: "Product stock limited!",
      });
    } else {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  const decrement = (data) => {
    setValue(value === 1 ? 1 : value - 1);
    const updateCartData = {
      ...data,
      qty: value === 1 ? 1 : value - 1,
    };
    quantityChangeHandler(updateCartData);
  };

  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center">
        {/* Quantity Controls */}
        <div>
          <div
            className="bg-[#e44343] border border-[#e4434373] rounded-full w-[22px] h-[22px] flex items-center justify-center cursor-pointer"
            onClick={() => increment(data)}
          >
            <HiPlus size={18} color="#fff" />
          </div>
          <span className="pl-[10px]">{data.qty}</span>
          <div
            className="bg-[#a7abb14f] rounded-full w-[22px] h-[22px] flex items-center justify-center cursor-pointer"
            onClick={() => decrement(data)}
          >
            <HiOutlineMinus size={16} color="#7d879c" />
          </div>
        </div>
        {/* Product Image */}
        <img
          src={`${backend_url}${data?.images[0]}`}
          alt=""
          className="w-[130px] h-[80px] ml-7 mr-7 object-cover rounded-md"
        />
        <div className="pl-[20px]">
          <h1>{data.name}</h1>
          <h4 className="font-[400] text-[15px] text-[#00000082]">
            ${data.discountPrice} * {value}
          </h4>
          <h4 className="font-[600] text-[17px] pt-[3px] font-Roboto text-[#d02222]">
            US${totalPrice}
          </h4>
        </div>
        <RxCross1 className="cursor-pointer" size={50} onClick={() => {removeFromCartHandler(data)}}/>
      </div>
    </div>
  );
};

export default Cart;
