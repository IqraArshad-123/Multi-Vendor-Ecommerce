import React from 'react'
import ShopCreation from '../components/Shop/ShopCreation.jsx';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ShopCreate = () => {
  const {isSeller, seller} = useSelector((state) => state.seller);
  const navigate = useNavigate();

  useEffect(() =>{
      if(isSeller === true){
        navigate(`/shop/${seller?._id}`);
      }
    },[isSeller, seller, navigate])
  return (
    <div>
        <ShopCreation/>
    </div>
  )
}

export default ShopCreate