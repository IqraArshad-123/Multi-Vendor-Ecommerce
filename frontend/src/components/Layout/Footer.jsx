import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => <footer className="bg-black text-white px-6 py-10 mt-10">
  <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-3">
    <div><Link to="/"><img src="/logo.svg" alt="e-shop home" className="w-36 bg-white rounded p-2" /></Link><p className="text-gray-300 mt-4">Browse products from independent shops.</p></div>
    <nav aria-label="Shopping"><h2 className="font-semibold mb-3">Shop</h2><div className="flex flex-col gap-2 text-gray-300"><Link to="/products">All products</Link><Link to="/best-selling">Best sellers</Link><Link to="/events">Events</Link></div></nav>
    <nav aria-label="Account and help"><h2 className="font-semibold mb-3">Account and help</h2><div className="flex flex-col gap-2 text-gray-300"><Link to="/faq">Frequently asked questions</Link><Link to="/profile">My account and orders</Link><Link to="/shop-login">Seller login</Link><Link to="/shop-create">Open a shop</Link></div></nav>
  </div>
  <p className="max-w-6xl mx-auto mt-8 pt-5 border-t border-gray-700 text-sm text-gray-400">© {new Date().getFullYear()} e-shop</p>
</footer>;
export default Footer;
