import React from 'react'
import UserOrderDetails from '../components/Shop/UserOrderDetails.jsx'
import Footer from '../components/Layout/Footer.jsx'
import Header from '../components/Layout/Header.jsx'

function OrderDetailsPage() {
  return (
    <div>
        <Header/>
        <UserOrderDetails/>
        <Footer/>
    </div>
  )
}

export default OrderDetailsPage