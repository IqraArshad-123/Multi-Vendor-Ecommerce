import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CardNumberElement, CardCvcElement, CardExpiryElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSelector, useDispatch } from 'react-redux';
import { server } from '../../server';
import axios from 'axios';
import Swal from 'sweetalert2';

const Payment = () => {
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('cash');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('latestOrder'));
      if (!saved?.cart?.length || !saved.shippingAddress || !saved.idempotencyKey) { navigate('/checkout', {replace:true}); return; }
      setOrder(saved);
    } catch { navigate('/checkout', {replace:true}); }
  }, [navigate]);
  const pay = async event => {
    event.preventDefault();
    if (locked.current || !order) return;
    locked.current = true; setBusy(true);
    try {
      let paymentInfo = order.paymentInfo;
      if (!paymentInfo?.id) {
        if (method === 'card') {
          if (!stripe || !elements) throw new Error('Card payments are still loading. Please try again or use cash on delivery.');
          const {data} = await axios.post(`${server}/api/v2/payment/process`, order, {withCredentials:true});
          if (Number(data.totalPrice) !== Number(order.totalPrice)) throw new Error('Your cart price changed. Return to checkout to review the new total.');
          const result = await stripe.confirmCardPayment(data.clientSecret, {payment_method:{card:elements.getElement(CardNumberElement),billing_details:{name:user?.name,email:user?.email}}});
          if (result.error) throw new Error(result.error.message);
          if (result.paymentIntent?.status !== 'succeeded') throw new Error('Payment is not complete. Please try again.');
          paymentInfo = {type:'Credit Card',id:result.paymentIntent.id};
          const paid = {...order,paymentInfo};
          localStorage.setItem('latestOrder',JSON.stringify(paid)); setOrder(paid);
        } else paymentInfo = {type:'Cash On Delivery'};
      }
      const {data} = await axios.post(`${server}/api/v2/order/create-order`, {...order,paymentInfo}, {withCredentials:true});
      if (!data.orders?.length) throw new Error('Order confirmation was not received. Please retry.');
      localStorage.setItem('lastSuccessfulOrder',JSON.stringify({ids:data.orders.map(item=>item._id),total:data.orders.reduce((sum,item)=>sum+item.totalPrice,0)}));
      localStorage.setItem('cartItems','[]'); localStorage.removeItem('latestOrder');
      dispatch({type:'clearCart'}); navigate('/order/success',{replace:true});
    } catch (error) {
      Swal.fire({icon:'error',title:'Checkout could not finish',text:error.response?.data?.message || error.message || 'Please try again.'});
    } finally { locked.current=false; setBusy(false); }
  };
  if (!order) return <p className="p-10 text-center">Loading checkout...</p>;
  return <form onSubmit={pay} className="max-w-3xl mx-auto p-6 my-8 bg-white rounded-lg shadow">
    <h1 className="text-2xl font-semibold mb-6">Payment</h1>
    <div className="space-y-2 border-b pb-5 mb-5">
      <p>Products: ${Number(order.subTotalPrice).toFixed(2)}</p>
      <p>Shipping: ${Number(order.shipping).toFixed(2)}</p>
      <p>Discount: -${Number(order.discountPrice || 0).toFixed(2)}</p>
      <p className="text-xl font-semibold">Total: ${Number(order.totalPrice).toFixed(2)} USD</p>
    </div>
    {order.paymentInfo?.id ? <p className="mb-4">Your card payment was received. Retry to finish saving your order; you will not be charged again.</p> : <fieldset disabled={busy} className="space-y-5">
      <legend className="font-semibold mb-3">Choose a payment method</legend>
      <label className="flex gap-2"><input type="radio" name="payment" checked={method==='cash'} onChange={()=>setMethod('cash')} />Cash on delivery</label>
      <label className="flex gap-2"><input type="radio" name="payment" checked={method==='card'} onChange={()=>setMethod('card')} disabled={!stripe} />Credit or debit card {!stripe && '(unavailable)'}</label>
      {method==='card' && <div className="space-y-4">
        <div><label>Card number</label><div className="border rounded p-3 mt-1"><CardNumberElement /></div></div>
        <div><label>Expiry date</label><div className="border rounded p-3 mt-1"><CardExpiryElement /></div></div>
        <div><label>Security code</label><div className="border rounded p-3 mt-1"><CardCvcElement /></div></div>
      </div>}
    </fieldset>}
    <button type="submit" disabled={busy} className="mt-6 bg-black text-white rounded px-6 py-3 disabled:opacity-50">{busy ? 'Processing...' : order.paymentInfo?.id ? 'Finish order' : method==='card' ? `Pay $${Number(order.totalPrice).toFixed(2)}` : 'Place order'}</button>
    {!busy && !order.paymentInfo?.id && <Link to="/checkout" className="ml-5 underline">Back to checkout</Link>}
  </form>;
};
export default Payment;
