import React from "react";
import Header from "../components/Layout/Header"; // Check kar lein aapka path sahi ho
import Footer from "../components/Layout/Footer"; // Check kar lein aapka path sahi ho
import { Link } from "react-router-dom";

const OrderSuccessPage = () => {
  return (
    <div className="w-full min-h-screen bg-[#f6f6f5] flex flex-col justify-between">
      <div>
        <Header />

        {/* Beautiful Success Alert Box */}
        <div className="w-full flex flex-col items-center justify-center my-16">
          <div className="w-[90%] md:w-[50%] bg-white p-8 rounded-lg shadow-md text-center flex flex-col items-center">
            {/* Animated SVG Green Check Animation */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-green-500 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Thank You For Your Order!
            </h1>
            <p className="text-gray-600 text-[16px] mb-6">
              Your order has been placed successfully. We will get in touch with
              you shortly! 🛍️✨{" "}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link
                to="/"
                className="bg-[#f63b60] text-white px-6 py-2.5 rounded-md font-semibold hover:bg-[#e03050] transition duration-200"
              >
                Continue Shopping
              </Link>
              <Link
                to="/profile"
                className="bg-gray-800 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-gray-900 transition duration-200"
              >
                Track Your Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
