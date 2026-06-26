import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null,
};

export const userReducer = createReducer(initialState, (builder) => {
  builder
    // ========== Load User ==========
    .addCase("LoadUserRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadUserSuccess", (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    })
    .addCase("LoadUserFail", (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    })

    // ========== Update User Information ==========
    .addCase("updateUserInfoRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateUserInfoSuccess", (state, action) => {
      state.loading = false;
      state.user = action.payload;
    })
    .addCase("updateUserInfoFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // ========== Update User Address ==========
    .addCase("updateUserAddressRequest", (state) => {
      state.addressLoading = true;
    })
    .addCase("updateUserAddressSuccess", (state, action) => {
      state.addressLoading = false;
      state.user = action.payload;
    })
    .addCase("updateUserAddressFailed", (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    })

    // ========== Delete User Address ==========
    .addCase("deleteUserAddressRequest", (state) => {
      state.addressLoading = true;
    })
    .addCase("deleteUserAddressSuccess", (state, action) => {
      state.addressLoading = false;
      state.user = action.payload;
    })
    .addCase("deleteUserAddressFailed", (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    })

    // ========== Clear Errors ==========
    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});