import axios from "axios";

const USER_TOKEN_KEY = "token";
const SELLER_TOKEN_KEY = "seller_token";

export const setUserToken = (token) => {
  if (!token) return;
  localStorage.setItem(USER_TOKEN_KEY, token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const setSellerToken = (token) => {
  if (!token) return;
  localStorage.setItem(SELLER_TOKEN_KEY, token);
  axios.defaults.headers.common["Seller-Token"] = token;
};

export const clearUserToken = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  delete axios.defaults.headers.common.Authorization;
};

export const clearSellerToken = () => {
  localStorage.removeItem(SELLER_TOKEN_KEY);
  delete axios.defaults.headers.common["Seller-Token"];
};

export const initAuthFromStorage = () => {
  const userToken = localStorage.getItem(USER_TOKEN_KEY);
  const sellerToken = localStorage.getItem(SELLER_TOKEN_KEY);

  if (userToken) {
    axios.defaults.headers.common.Authorization = `Bearer ${userToken}`;
  }

  if (sellerToken) {
    axios.defaults.headers.common["Seller-Token"] = sellerToken;
  }
};
