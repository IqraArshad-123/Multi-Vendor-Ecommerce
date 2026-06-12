import { createAction, createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
  orders: [],   // ✅ make sure orders is here
  error: null,
};

// Actions
export const clearErrors = createAction("clearErrors");
export const getAllOrdersUserRequest = createAction("getAllOrdersUserRequest");
export const getAllOrdersUserSuccess = createAction("getAllOrdersUserSuccess");
export const getAllOrdersUserFailed = createAction("getAllOrdersUserFailed");
export const getAllOrdersShopRequest = createAction("getAllOrdersShopRequest");
export const getAllOrdersShopSuccess = createAction("getAllOrdersShopSuccess");
export const getAllOrdersShopFailed = createAction("getAllOrdersShopFailed");

// Reducer
export const orderReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getAllOrdersUserRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(getAllOrdersUserSuccess, (state, action) => {
      state.isLoading = false;
      state.orders = action.payload;
    })
    .addCase(getAllOrdersUserFailed, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    //get all orders of shop
    .addCase(getAllOrdersShopRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(getAllOrdersShopSuccess, (state, action) => {
      state.isLoading = false;
      state.orders = action.payload;
    })
    .addCase(getAllOrdersShopFailed, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(clearErrors, (state) => {
      state.error = null;
    });
});