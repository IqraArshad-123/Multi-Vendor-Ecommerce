import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { backend_url } from "../../../server.js";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist.js";
import Swal from "sweetalert2";
import { addToCart } from "../../../redux/actions/cart.js";
import Ratings from "../../Products/Ratings.jsx";

const ProductCard = ({ data }) => {
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);

  const productId = data?._id || data?.id;

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === productId)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, productId]);

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };
  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Item already in cart!",
      });
    } else {
      if (data?.stock < 1) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limited",
          text: "Product stock limited!",
        });
      } else {
        const cartData = { ...(data || {}), qty: 1 };

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

  // ========== FIXED: Handled multiple variations of image URLs from Backend ==========
 // Product image handling (Local + Cloudinary both)
let imgSource = "";

if (data?.images?.length > 0) {

  imgSource = data.images[0].startsWith("http")
    ? data.images[0]
    : `${backend_url}${data.images[0]}`;

} else if (data?.image_Url?.length > 0 && data.image_Url[0]?.url) {

  imgSource = data.image_Url[0].url;

} else if (typeof data?.images === "string") {

  imgSource = data.images.startsWith("http")
    ? data.images
    : `${backend_url}${data.images}`;

}

  return (
    <>
      <div className="w-full h-[370px] bg-white rounded-lg shadow-sm p-3 relative cursor-pointer">
        <div className="flex justify-end"></div>

        {/* ========== FIXED: Fixed product/undefined URL mapping ========== */}
        <Link to={`/product/${productId}`}>
          <img
            src={imgSource}
            alt={data?.name || "product"}
            className="w-full h-[170px] object-contain"
          />
        </Link>
        <Link to={`/shop/preview/${data?.shop?._id || data?.shop?.id || data?.shopId}`}>
          <h5 className={`${styles.shop_name}`}>{data?.shop?.name}</h5>
        </Link>
        <Link to={`/product/${productId}`}>
          <h4 className="pb-3 font-[500]">
            {data?.name?.length > 40
              ? data.name.slice(0, 40) + "..."
              : data?.name}
          </h4>
          <div className="flex">
            <Ratings rating={data?.ratings} />
          </div>

          <div className="py-2 flex items-center justify-between">
            <div className="flex">
              <h5 className={`${styles.productDiscountPrice}`}>
                {data?.discount_price ?? data?.discountPrice}$
              </h5>

              <h4 className={`${styles.price}`}>
                {(data?.price ?? data?.originalPrice)
                  ? (data?.price ?? data?.originalPrice) + "$"
                  : null}
              </h4>
            </div>

            <span className="ml-2 whitespace-nowrap font-[400] text-[17px] text-[#68d284]">
              {data?.total_sell ?? data?.sold_out ?? 0} sold
            </span>
          </div>
        </Link>

        {/* side options */}
        <div className="">
          {click ? (
            <AiFillHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => removeFromWishlistHandler(data)}
              color={click ? "red" : "#333"}
              title="Remove from Wishlist"
            />
          ) : (
            <AiOutlineHeart
              size={22}
              className="cursor-pointer absolute right-2 top-5"
              onClick={() => addToWishlistHandler(data)}
              color={click ? "red" : "#333"}
              title="Add to Wishlist"
            />
          )}
          <AiOutlineEye
            size={22}
            className="cursor-pointer absolute right-2 top-14"
            onClick={() => setOpen(!open)}
            color="#333"
            title="Quick view"
          />
          <AiOutlineShoppingCart
            size={25}
            className="cursor-pointer absolute right-2 top-24"
            onClick={() => addToCartHandler(productId)}
            color="#444"
            title="Add to cart"
          />
          {open ? <ProductDetailsCard setOpen={setOpen} data={data} /> : null}
        </div>
      </div>
    </>
  );
};

export default ProductCard;