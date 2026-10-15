import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { addToCart } from "../../redux/actions/cart";
import { imageUrl } from "../../server";
export default function Wishlist({ setOpenWishlist }) {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  return <div className="fixed inset-0 bg-[#0000004b] z-[100]" onClick={() => setOpenWishlist(false)}>
    <section role="dialog" aria-modal="true" aria-label="Wishlist" className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-white overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Wishlist ({wishlist.length})</h2>
        <button type="button" aria-label="Close wishlist" onClick={() => setOpenWishlist(false)} className="p-3">Close</button>
      </div>
      {!wishlist.length && <p>Your wishlist is empty. Tap a product's heart to save it.</p>}
      {wishlist.map((item) => {
        const inCart = cart.some((product) => product._id === item._id);
        return <article key={item._id} className="border-b py-4 flex gap-3">
          <img src={imageUrl(item.images?.[0] || item.image_Url?.[0]?.url)} alt={item.name} className="w-20 h-20 object-contain flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <Link to={`/product/${item._id}`} onClick={() => setOpenWishlist(false)} className="font-medium break-words">{item.name}</Link>
            <p className="text-red-600">US${Number(item.discountPrice ?? item.discount_price ?? 0).toFixed(2)}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <button type="button" disabled={inCart || item.stock < 1} className="text-blue-700 disabled:text-gray-500" onClick={() => dispatch(addToCart({ ...item, qty: 1 }))}>{inCart ? "In cart" : item.stock < 1 ? "Out of stock" : "Add to cart"}</button>
              <button type="button" aria-label={`Remove ${item.name} from wishlist`} onClick={() => dispatch(removeFromWishlist(item))}>Remove</button>
            </div>
          </div>
        </article>;
      })}
    </section>
  </div>;
}
