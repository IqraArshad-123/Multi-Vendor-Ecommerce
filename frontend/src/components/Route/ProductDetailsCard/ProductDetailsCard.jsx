import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../../styles/styles";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { backend_url } from "../../../server";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { addToCart } from "../../../redux/actions/cart";

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);

  const handleMessageSubmit = () => {};

  const decrementCount = () => {
    if (count > 1) setCount(count - 1);
  };

  const incrementCount = () => {
    setCount(count + 1);
  };

    const imgSource =
    data?.image_Url?.[0]?.url || (data?.images?.[0] && `${data.images[0]}`);

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Item already in cart!",
      });
    } else {
      if (data.stock < count) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limited",
          text: "Product stock limited!",
        });
      } else {
        const cartData = { ...data, qty: count };

        dispatch(addToCart(cartData));

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Item added to cart successfully!",
          timer: 3000,
          showConfirmButton: true,
        });
      }
    }
  };



  

  return (
    <div className="bg-[#fff]">
      {data ? (
        <div className="w-full fixed h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
          <div className="w-[90%] md:w-[60%] h-[90vh] overflow-y-scroll md:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
            <RxCross1
              size={30}
              className="absolute right-3 top-3 z-50 cursor-pointer"
              onClick={() => setOpen(false)}
            />
            <div className="w-full block 800px:flex">
              {/* Left Side */}
              <div className="w-full 800px:w-[50%]">
                <img
                  src={imgSource}
                  alt={data?.name}
                  className="w-full object-contain h-[300px]"
                />
                <Link
                  to={data?.shop?._id ? `/shop/preview/${data.shop._id}` : "#"}
                >
                  <div className="flex mt-3">
                    <img
                      src={`${backend_url}${data?.shop?.avatar}`}
                      alt=""
                      className="w-[50px] h-[50px] rounded-full mr-2"
                    />
                    <div>
                      <h3 className={styles.shop_name}>{data?.shop?.name}</h3>
                      <h5 className="pb-3 text-[15px]">
                        ({data?.shop?.ratings || 0}) Ratings
                      </h5>
                    </div>
                  </div>
                </Link>
                <div
                  className={`${styles.button} bg-[#000] mt-4 h-11`}
                  onClick={handleMessageSubmit}
                >
                  <span className="text-[#fff] flex items-center">
                    Send Message <AiOutlineMessage className="ml-1" />
                  </span>
                </div>
                <h5 className="text-[16px] text-[red] mt-5">
                  ({data?.total_sell || data?.sold_out || 0}) Sold out
                </h5>
              </div>

              {/* Right Side */}
              <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                <h1 className={`${styles.productTitle} text-[20px]`}>
                  {data?.name}
                </h1>
                <p>{data?.description}</p>
                <div className="pt-3 flex">
                  <h5 className={`${styles.productDiscountPrice}`}>
                    {data?.discount_price || data?.discountPrice}$
                  </h5>
                  <h4 className={`${styles.price}`}>
                    {data?.price || data?.originalPrice
                      ? (data?.price || data?.originalPrice) + "$"
                      : null}
                  </h4>
                </div>

                <div className="flex items-center mt-12 justify-between pr-3">
                  <div>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300"
                      onClick={decrementCount}
                    >
                      -
                    </button>
                    <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">
                      {count}
                    </span>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-r px-4 py-2 shadow-lg hover:opacity-75 transition duration-300"
                      onClick={incrementCount}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    {click ? (
                      <AiFillHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => setClick(!click)}
                        color="red"
                      />
                    ) : (
                      <AiOutlineHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => setClick(!click)}
                        color="#333"
                      />
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.button} mt-6 flex items-center h-11`}
                  onClick={() => addToCartHandler(data._id)}
                >
                  <span className="text-[#fff] flex items-center">
                    Add to Cart <AiOutlineShoppingCart className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetailsCard;
