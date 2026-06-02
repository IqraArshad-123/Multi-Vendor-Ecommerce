import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user.js";
import { sellerReducer } from "./reducers/seller.js";
import { productReducer } from "./reducers/product.js";
import { eventReducer } from "./reducers/event.js";
import { cartReducer } from "./reducers/cart.js";
import { wishlistReducer } from "./reducers/wishlist.js";

const Store = configureStore({
    reducer: {
        user: userReducer,
        seller: sellerReducer,
        products: productReducer,
        events: eventReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
    },
});

export default Store;