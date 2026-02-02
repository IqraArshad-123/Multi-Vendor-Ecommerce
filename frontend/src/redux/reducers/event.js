import { createAction, createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

export const eventCreateRequest = createAction("eventCreateRequest");
export const eventCreateSuccess = createAction("eventCreateSuccess");
export const eventCreateFail = createAction("eventCreateFail");
export const clearErrors = createAction("clearErrors");
export const getAllEventsShopRequest = createAction("getAllEventsShopRequest");
export const getAllEventsShopSuccess = createAction("getAllEventsShopSuccess");
export const getAllEventsShopFailed = createAction("getAllEventsShopFailed");
export const deleteEventsuccess = createAction("deleteEventsuccess");
export const deleteeventFailed = createAction("deleteeventFailed");
export const deleteeventRequest = createAction("deleteeventRequest");

export const eventReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(eventCreateRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(eventCreateSuccess, (state, action) => {
      state.isLoading = false;
      state.event = action.payload;
      state.success = true;
    })
    .addCase(eventCreateFail, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.success = false;
    })

    //get all Events of shop

    .addCase(getAllEventsShopRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(getAllEventsShopSuccess, (state, action) => {
      state.isLoading = false;
      state.events = action.payload;
    })

    .addCase(getAllEventsShopFailed, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(clearErrors, (state) => {
      state.error = null;
    })

    //delete event of a shop

    .addCase(deleteeventRequest, (state) => {
      state.isLoading = true;
    })
    .addCase(deleteEventsuccess, (state, action) => {
      state.isLoading = false;
      state.message = action.payload;
    })

    .addCase(deleteeventFailed, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
});
