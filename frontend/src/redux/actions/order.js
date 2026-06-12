import axios from "axios";
import { server } from "../../server";
import { 
  getAllOrdersUserFailed, 
  getAllOrdersUserRequest, 
  getAllOrdersUserSuccess,
  getAllOrdersShopRequest,  
  getAllOrdersShopSuccess,
  getAllOrdersShopFailed 
} from "../reducers/order";

// 1. Get all orders of user
export const getAllOrdersOfUser = (userId) => async (dispatch) => {
  try {
    dispatch(getAllOrdersUserRequest());

    const { data } = await axios.get(`${server}/api/v2/order/get-all-orders/${userId}`);

    dispatch(getAllOrdersUserSuccess(data.orders));
  } catch (error) {
    dispatch(getAllOrdersUserFailed(error.response?.data?.message || error.message));
  }
};

export const getAllOrdersOfShop = (shopId) => async (dispatch) => {
  try {
    dispatch(getAllOrdersShopRequest()); 

    const { data } = await axios.get(
      `${server}/api/v2/order/get-seller-all-orders/${shopId}` 
    );

    dispatch(getAllOrdersShopSuccess(data.orders)); 
  } catch (error) {
    dispatch(getAllOrdersShopFailed(error.response?.data?.message || error.message)); 
  }
};