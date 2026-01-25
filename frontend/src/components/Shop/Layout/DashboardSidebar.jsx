import React from "react";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { Link } from "react-router-dom";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
function DashboardSidebar({ active }) {
  return (
    <div className="w-full md:w-[250px] h-[89vh] bg-white shadow-sm overflow-y-auto sticky top-0 left-0 z-10">
      {/* single item */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard" className="w-full flex items-center">
          <RxDashboard
            size={25}
            className={`${
              active === 1 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 1 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Dashboard
          </h5>
        </Link>
      </div>

      {/* All orders */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard-orders" className="w-full flex items-center">
          <FiShoppingBag
            size={25}
            className={`${
              active === 2 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          
             <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 2 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            All Orders
          </h5>
        </Link>
      </div>

      {/* All products */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard-products" className="w-full flex items-center">
          <FiPackage
            size={25}
            className={`${
              active === 3 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 3 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            All Products
          </h5>
        </Link>
      </div>

      {/* create products */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link
          to="/dashboard-create-product"
          className="w-full flex items-center"
        >
          <AiOutlineFolderAdd
            size={25}
            className={`${
              active === 4 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 4 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Create Product
          </h5>
        </Link>
      </div>

      {/* All events */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard-events" className="w-full flex items-center">
          <MdOutlineLocalOffer
            size={25}
            className={`${
              active === 5 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 5 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            All Events
          </h5>
        </Link>
      </div>

      {/* Create events */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link
          to="/dashboard-create-events"
          className="w-full flex items-center"
        >
          <VscNewFile
            size={25}
            className={`${
              active === 6 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 6 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Create Event
          </h5>
        </Link>
      </div>

      {/* Withdraw money */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link
          to="/dashboard-withdraw-money"
          className="w-full flex items-center"
        >
          <CiMoneyBill
            size={25}
            className={`${
              active === 7 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 7 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Withdraw Money
          </h5>
        </Link>
      </div>

      {/*Shop inbox */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard-messages" className="w-full flex items-center">
          <BiMessageSquareDetail
            size={25}
            className={`${
              active === 8 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 8 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Shop Inbox
          </h5>
        </Link>
      </div>

      {/* Discount Codes*/}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard-coupouns" className="w-full flex items-center">
          <AiOutlineGift
            size={25}
            className={`${
              active === 9 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 9 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Discount Codes
          </h5>
        </Link>
      </div>

      {/* Refunds */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/dashboard-refunds" className="w-full flex items-center">
          <HiOutlineReceiptRefund
            size={25}
            className={`${
              active === 10 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 10 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Refunds
          </h5>
        </Link>
      </div>

      {/* Settings */}
      <div className="w-full flex items-center p-2 md:p-4">
        <Link to="/settings" className="w-full flex items-center">
          <CiSettings
            size={25}
            className={`${
              active === 11 ? "text-[crimson]" : "text-gray-600"
            } md:text-[30px]`}
          />
          <h5
            className={`pl-2 text-[16px] md:text-[18px] font-[400] hidden sm:block ${
              active === 11 ? "text-[crimson]" : "text-gray-600"
            }`}
          >
            Settings
          </h5>
        </Link>
      </div>
    </div>
  );
}

export default DashboardSidebar;