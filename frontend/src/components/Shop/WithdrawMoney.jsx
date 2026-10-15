import React from 'react';
import { useSelector } from 'react-redux';
const WithdrawMoney = () => {
  const {seller}=useSelector(state=>state.seller);
  return <div className="w-full p-8"><div className="bg-white rounded p-8 text-center">
    <h1 className="text-2xl font-semibold mb-4">Seller balance</h1>
    <p className="text-xl mb-4">Recorded balance: ${Number(seller?.availableBalance || 0).toFixed(2)}</p>
    <p>Bank withdrawals are not configured for this store.</p>
    <p className="text-sm text-gray-600 mt-2">Contact the store operator to arrange a payout. No bank transfer can be submitted from this page.</p>
  </div></div>;
};
export default WithdrawMoney;
