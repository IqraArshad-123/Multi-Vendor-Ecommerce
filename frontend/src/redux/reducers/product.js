import { createAction, createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const productCreateRequest = createAction("productCreateRequest");
export const productCreateSuccess = createAction("productCreateSuccess");
export const productCreateFail = createAction("productCreateFail");
export const clearErrors = createAction("clearErrors");

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
    .addCase(clearErrors, (state) => {
      state.error = null;
    });
});
