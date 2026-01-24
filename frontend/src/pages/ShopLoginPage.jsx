import React from 'react'
import ShopLogin from "../components/Shop/ShopLogin.jsx";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const ShopLoginPage = () => {
    const {isSeller, seller} = useSelector((state) => state.seller);
  const navigate = useNavigate();

  useEffect(() =>{
    if(isSeller === true){
      navigate(`/shop/${seller?._id}`);
    }
  },[isSeller, seller, navigate])
  return (
    <div>
        <ShopLogin/>
    </div>
  )
}

export default ShopLoginPage