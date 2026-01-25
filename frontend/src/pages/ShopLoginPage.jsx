import React from 'react'
import ShopLogin from "../components/Shop/ShopLogin.jsx";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const ShopLoginPage = () => {
    const {isSeller,  isLoading} = useSelector((state) => state.seller);
  const navigate = useNavigate();

  useEffect(() =>{
    if(isSeller === true){
      navigate(`/dashboard`)
    }
  },[isSeller, isLoading])
  return (
    <div>
        <ShopLogin/>
    </div>
  )
}

export default ShopLoginPage