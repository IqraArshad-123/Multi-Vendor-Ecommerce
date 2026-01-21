import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { Link } from "react-router-dom";

const Cart = ({ setOpenCart }) => {
  const cartData = [
    {
      name: "Iphone 14 Pro Max 256GB SSD and 8GB RAM Silver colour",
      description: "test",
      price: 999,
    },
    {
      name: "Iphone 14 Pro Max 256GB SSD and 8GB RAM Silver colour",
      description: "test",
      price: 245,
    },
    {
      name: "Iphone 14 Pro Max 256GB SSD and 8GB RAM Silver colour",
      description: "test",
      price: 645,
    },
  ];
  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
      <div className="fixed top-0 right-0 min-h-full w-[25%] bg-white flex flex-col justify-between shadow-sm">
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
            <h5 className="pl-2 text-[20px] font-[500]">3 Items</h5>
          </div>
          {/* cart single items */}
          <br />
          <div className="w-full border-t">
            {cartData &&
              cartData.map((i, index) => <CartSingle key={index} data={i} />)}
          </div>
        </div>
        {/* Checkout Button */}
      <div className="px-5 mb-3">
        <Link to="/checkout">
          <div className="h-[45px] flex items-center justify-center bg-[#e44343] w-full rounded-md">
            <h1 className="text-white text-[15px] font-semibold">
              Checkout Now (USD$1080)
            </h1>
          </div>
        </Link>
      </div>
      </div>
    </div>
  );
};

const CartSingle = ({ data }) => {
  const [value, setValue] = useState(1);
  const totalPrice = data.price * value;

  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center">
        {/* Quantity Controls */}
        <div>
          <div
            className="bg-[#e44343] border border-[#e4434373] rounded-full w-[22px] h-[22px] flex items-center justify-center cursor-pointer"
            onClick={() => setValue(value + 1)}
          >
            <HiPlus size={18} color="#fff" />
          </div>
          <span className="pl-[10px]">{value}</span>
          <div
            className="bg-[#a7abb14f] rounded-full w-[22px] h-[22px] flex items-center justify-center cursor-pointer"
            onClick={() => setValue(value === 1 ? 1 : value - 1)}
          >
            <HiOutlineMinus size={16} color="#7d879c" />
          </div>
        </div>
        {/* Product Image */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQIRGp7MKNxaogrOjT1VN9SVZ5bKGneoz62A&s"
          alt=""
          className="w-[80px] h-[80px] ml-7 object-cover rounded-md"
        />
        <div className="pl-[20px]">
            <h1>{data.name}</h1>
            <h4 className="font-[400] text-[15px] text-[#00000082]">${data.price} * {value}</h4>
            <h4 className="font-[600] text-[17px] pt-[3px] font-Roboto text-[#d02222]">US${totalPrice}</h4>
        </div>
        <RxCross1 className="cursor-pointer" size={25}/>
      </div>
    </div>
  );
};

export default Cart;
