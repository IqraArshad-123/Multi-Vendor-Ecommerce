import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user.js";
import { sellerReducer } from "./reducers/seller.js";

const Store = configureStore({
    reducer: {
        user: userReducer,
        seller: sellerReducer,
    },
});

export default Store;