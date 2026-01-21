import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import {BsCartPlus} from "react-icons/bs"
import { AiOutlineHeart } from "react-icons/ai";

const Wishlist = ({ setOpenWishlist }) => {
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
              onClick={() => setOpenWishlist(false)}
            />
          </div>
          {/* Heading */}
          <div className="flex items-center p-3">
            <AiOutlineHeart size={20} />
            <h5 className="pl-2 text-[20px] font-[500]">3 Items</h5>
          </div>
          {/* cart single items */}
          <br />
          <div className="w-full border-t">
            {cartData &&
              cartData.map((i, index) => <CartSingle key={index} data={i} />)}
          </div>
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
        <RxCross1 size={20} className="cursor-pointer"/>
        {/* Product Image */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQIRGp7MKNxaogrOjT1VN9SVZ5bKGneoz62A&s"
          alt=""
          className="w-[80px] h-[80px] ml-5 object-cover rounded-md"
        />
          
        <div className="pl-[20px]">
            <h1>{data.name}</h1>
            <h4 className="font-[600] text-[17px] pt-[3px] font-Roboto text-[#d02222]">US${totalPrice}</h4>
        </div>
        <div className="">
            <BsCartPlus className="cursor-pointer" size={20} title="Add to Cart"/>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;