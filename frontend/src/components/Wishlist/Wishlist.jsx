import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { BsCartPlus } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { backend_url } from "../../server";
import { addToCart } from "../../redux/actions/cart";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addToCart(newData));
    setOpenWishlist(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
      <div className="fixed top-0 right-0 min-h-full w-[25%] bg-white flex flex-col justify-between shadow-sm">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setOpenWishlist(false)}
              />
            </div>
            <h5 className="text-2xl">Wishlist is Empty!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setOpenWishlist(false)}
                />
              </div>
              {/* Heading */}
              <div className="flex items-center p-3">
                <AiOutlineHeart size={20} />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {wishlist && wishlist.length} Items
                </h5>
              </div>
              {/* cart single items */}
              <br />
              <div className="w-full border-t">
                {wishlist &&
                  wishlist.map((i, index) => (
                    <CartSingle
                      key={index}
                      data={i}
                      removeFromWishlistHandler={removeFromWishlistHandler}
                      addToCartHandler={addToCartHandler}
                    />
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, removeFromWishlistHandler, addToCartHandler }) => {
  const [value, setValue] = useState(1);
  const totalPrice = data.discountPrice * value;

  return (
    <div className="border-b p-4">
      <div className="w-full flex items-center">
        <RxCross1
          size={50}
          className="cursor-pointer"
          onClick={() => removeFromWishlistHandler(data)}
        />
        {/* Product Image */}
        <img
          src={`${backend_url}${data?.images[0]}`}
          alt=""
          className="w-[130px] h-[80px] ml-7 mr-7 object-cover rounded-md"
        />

        <div className="pl-[20px]">
          <h1>{data.name}</h1>
          <h4 className="font-[600] text-[17px] pt-[3px] font-Roboto text-[#d02222]">
            US${totalPrice}
          </h4>
        </div>
        <div className="">
          <BsCartPlus
            className="cursor-pointer"
            size={20}
            title="Add to Cart"
            onClick={() => {
              addToCartHandler(data);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
