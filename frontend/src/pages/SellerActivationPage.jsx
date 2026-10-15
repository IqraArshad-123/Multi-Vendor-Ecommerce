import React, {useEffect,useRef,useState} from 'react';
import axios from 'axios';
import {Link,useParams} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {server} from '../server';
import {loadSeller} from '../redux/actions/user';
import {setSellerToken} from '../utils/auth';
const SellerActivationPage=()=>{
 const {activation_token}=useParams();const started=useRef(null);const [state,setState]=useState('Activating your account...');const dispatch=useDispatch();
 useEffect(()=>{if(!activation_token || started.current===activation_token)return;started.current=activation_token;
 axios.post(server+'/api/v2/shop/activation',{activation_token},{withCredentials:true}).then(({data})=>{setSellerToken(data.token);dispatch(loadSeller());setState('Your account has been activated successfully.');}).catch(error=>setState(error.response?.data?.message || 'Activation failed. Please try again.'));
 },[activation_token,dispatch]);
 return <div className="min-h-screen flex flex-col gap-5 justify-center items-center p-6 text-center"><p>{state}</p><Link className="underline" to="/shop-login">Continue to login</Link></div>;
};export default SellerActivationPage;
