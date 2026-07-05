import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { server } from "../server";
import { loadSeller } from "../redux/actions/user";
import { setSellerToken } from "../utils/auth";

const SellerActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activation_token) {
      const activationEmail = async () => {
        try {
          const res = await axios.post(`${server}/api/v2/shop/activation`, {
            activation_token,
          });

          if (res.data.token) {
            setSellerToken(res.data.token);
            dispatch(loadSeller());
          }
        } catch (error) {
          console.log(error.response?.data?.message || error.message);
          setError(true);
        }
      };
      activationEmail();
    }
  }, [activation_token, dispatch]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      {error ? (
        <p>Your token is expired!</p>
      ) : (
        <p>Your account has been created successfully!</p>
      )}
    </div>
  );
};

export default SellerActivationPage;