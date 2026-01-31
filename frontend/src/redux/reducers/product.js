import { createAction, createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const productCreateRequest = createAction("productCreateRequest");
export const productCreateSuccess = createAction("productCreateSuccess");
export const productCreateFail = createAction("productCreateFail");
export const clearErrors = createAction("clearErrors");
export const getAllProductsShopRequest = createAction("getAllProductsShopRequest");
export const getAllProductsShopSuccess = createAction("getAllProductsShopSuccess");
export const getAllProductsShopFailed = createAction("getAllProductsShopFailed");
export const deleteProductSuccess = createAction("deleteProductSuccess");
export const deleteProductFailed = createAction("deleteProductFailed");
export const deleteProductRequest = createAction("deleteProductRequest");

export const productReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(productCreateRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(productCreateSuccess, (state, action) => {
      state.isLoading = false;
      state.product = action.payload;
      state.success = true;
    })
    .addCase(productCreateFail, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.success = false;
    })

    //get all products of shop

    .addCase(getAllProductsShopRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(getAllProductsShopSuccess, (state, action) => {
      state.isLoading = false;
      state.products = action.payload;
    })

    .addCase(getAllProductsShopFailed, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(clearErrors, (state) => {
      state.error = null;
    })

    //delete product of a shop

    .addCase(deleteProductRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(deleteProductSuccess, (state, action) => {
      state.isLoading = false;
      state.message = action.payload;
    })

    .addCase(deleteProductFailed, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
});
