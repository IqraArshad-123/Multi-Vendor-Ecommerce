import React from "react";
import { AiOutlineGift } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { BiMessageSquareDetail } from "react-icons/bi";
import { backend_url } from "../../../server";

function DashboardHeader() {
  const { seller } = useSelector((state) => state.seller);

  return (
    <div className="w-full bg-white shadow sticky top-0 left-0 z-30 flex items-center justify-between px-4 h-[80px]">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link to="/dashboard">
          <img
            src="https://shopo.quomodothemes.website/assets/images/logo.svg"
            alt=""
            className="h-[40px] md:h-[50px] w-auto" // Reduced logo size
          />
        </Link>
      </div>

      {/* Scrollable Icon Bar */}
      <div className="flex ml-4 overflow-x-auto max-w-full">
        <div className="flex items-center gap-6 md:gap-10 min-w-max">
          {" "}
          {/* Increased gap between icons */}
          <Link to="/dashboard/cupouns" className="800px:block hidden">
            <AiOutlineGift color="#555" size={25} className="cursor-pointer" />
          </Link>
          <Link to="/dashboard-events" className="800px:block hidden">
            <MdOutlineLocalOffer
              color="#555"
              size={25}
              className="cursor-pointer"
            />
          </Link>
          <Link to="/dashboard-products" className="800px:block hidden">
            <FiShoppingBag color="#555" size={25} className="cursor-pointer" />
          </Link>
          <Link to="/dashboard-orders" className="800px:block hidden">
            <FiPackage color="#555" size={25} className="cursor-pointer" />
          </Link>
          <Link to="/dashboard-messages" className="800px:block hidden">
            <BiMessageSquareDetail
              color="#555"
              size={25}
              className="cursor-pointer"
            />
          </Link>
          <Link to={`/shop/${seller._id}`} >
            <img
              src={`${backend_url}${seller?.avatar}`}
              alt=""
              className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
