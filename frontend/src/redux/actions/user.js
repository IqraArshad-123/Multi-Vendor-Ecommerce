import axios from "axios";
import { server } from "../../server.js";

//load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadUserRequest" });

    const { data } = await axios.get(`${server}/api/v2/user/getuser`, {
      withCredentials: true, // REQUIRED to send cookie
    });

    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadSellerRequest" });

    const { data } = await axios.get(`${server}/api/v2/shop/getSeller`, {
      withCredentials: true, // REQUIRED to send cookie
    });

    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller,
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

//user update information

export const updateUserInfomation =
  (name, email, phoneNumber, password) => async (dispatch) => {
    try {
      dispatch({ type: "updateUserInfoRequest" });

      const { data } = await axios.put(
        `${server}/api/v2/user/update-user-info`,
        { name, email, phoneNumber, password },
        { withCredentials: true },
      );

      dispatch({
        type: "updateUserInfoSuccess",
        payload: data.user,
      });
    } catch (error) {
      dispatch({
        type: "updateUserInfoFailed",
        payload: error.response.data.message,
      });
    }
  };

  // update user address
export const updatUserAddress =
  (country, city, address1, address2, zipCode, addressType) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "updateUserAddressRequest",
      });

      const { data } = await axios.put(
        `${server}/api/v2/user/update-user-addresses`,
        {
          country,
          city,
          address1,
          address2,
          zipCode,
          addressType,
        },
        { withCredentials: true }
      );

      dispatch({
        type: "updateUserAddressSuccess",
        payload: data.user
      });
    } catch (error) {
      dispatch({
        type: "updateUserAddressFailed",
        payload: error.response.data.message,
      });
    }
  };

    // delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserAddressRequest",
    });

    const { data } = await axios.delete(
      `${server}/api/v2/user/delete-user-address/${id}`,
      { withCredentials: true }
    );

    dispatch({
      type: "deleteUserAddressSuccess",
      payload: data.user
    });
  } catch (error) {
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.response.data.message,
    });
  }
};