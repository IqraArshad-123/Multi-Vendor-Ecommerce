import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { server } from "../server";

const ActivationPage = () => {
  const { activation_token } = useParams();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activation_token && !success) {
      const activationEmail = async () => {
        try {
          const res = await axios.post(`${server}/api/v2/user/activation`, {
            activation_token,
          });
          console.log(res.data.message);
          setSuccess(true);
        } catch (error) {
          console.log(error.response?.data?.message || error.message);
          if (!success) setError(true);
        }
      };
      activationEmail();
    }
  }, [activation_token]);

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

export default ActivationPage;
