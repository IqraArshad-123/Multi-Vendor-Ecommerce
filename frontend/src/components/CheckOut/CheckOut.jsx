import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { City, Country } from "country-state-city";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import Swal from "sweetalert2";


const CheckOut = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);

  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState(""); // ✅ fix: no null
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const paymentSubmit = () => {
   if(address1 === "" || address2 === "" || zipCode === null || country === "" || city === ""){
Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Please choose your delivery address!',
  confirmButtonColor: '#3085d6'
});   } else{
    const shippingAddress = {
      address1,
      address2,
      zipCode,
      country,
      city,
    };

    const orderData = {
      cart,
      totalPrice: Number(totalPrice),
      subTotalPrice,
      shipping,
      discountPrice,
      shippingAddress,
      user,
    }

    // update local storage with the updated orders array
    localStorage.setItem("latestOrder", JSON.stringify(orderData));
    navigate("/payment");
   }
  };


  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const shipping = subTotalPrice * 0.1;

  const discountPercentage = couponCodeData ? discountPrice : "";

 const totalPrice = couponCodeData
  ? subTotalPrice + shipping - discountPercentage
  : subTotalPrice + shipping;


 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!couponCode) {
Swal.fire({
  icon: 'error',
  title: 'Missing Code',
  text: 'Please enter a coupon code',
  confirmButtonColor: '#3085d6'
});    return;
  }

  try {
    const { data } = await axios.get(
      `${server}/api/v2/coupon/get-coupon-value/${couponCode}`
       
       
    );
     
     
    const coupon = data?.couponCode;

    if (!coupon) {
Swal.fire({
  icon: 'error',
  title: 'Invalid Coupon',
  text: "Coupon code doesn't exist!",
  confirmButtonColor: '#3085d6'
});      return;
    }

const isCouponValid = cart.filter(
  (item) => String(item.shopId || item.shop) === String(coupon.shop)
);
    if (isCouponValid.length === 0) {
Swal.fire({
  icon: 'error',
  title: 'Not Allowed',
  text: 'Coupon code is not valid for this shop',
  confirmButtonColor: '#3085d6'
});      return;
    }

    const eligiblePrice = isCouponValid.reduce(
      (acc, item) => acc + item.qty * item.discountPrice,
      0
    );

    const discount = (eligiblePrice * coupon.value) / 100;

    setDiscountPrice(discount);
    setCouponCodeData(coupon);

Swal.fire({
  icon: 'success',
  title: 'Coupon Applied!',
  text: `You saved $${discount.toFixed(2)}`,
  timer: 2500,
  showConfirmButton: false
});  } catch (error) {
    Swal.fire({
  icon: 'error',
  title: 'Error',
  text: error.response?.data?.message || "Something went wrong while applying coupon",
  confirmButtonColor: '#3085d6'
});
  }
};


  return (
    <div className="w-full flex flex-col items-center py-6 px-3 sm:px-6">
      <div className="w-full lg:w-[85%] xl:w-[70%] flex flex-col md:flex-row gap-6">
        {/* Shipping Info */}
        <div className="w-full md:w-[65%]">
          <ShippingInfo
            country={country}
            city={city}
            address1={address1}
            address2={address2}
            zipCode={zipCode}
            setCountry={setCountry}
            setCity={setCity}
            setAddress1={setAddress1}
            setAddress2={setAddress2}
            setZipCode={setZipCode}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            user={user}
          />
        </div>

        {/* Cart Data */}
        <div className="w-full md:w-[35%]">
          <CartData
            handleSubmit={handleSubmit}
            totalPrice={totalPrice}
            shipping={shipping}
            subTotalPrice={subTotalPrice}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            discountPercentage={discountPercentage}
          />
        </div>
      </div>

      {/* Payment Button */}
      <div className={`${styles.button} w-[180px] md:w-[260px] mt-8`}  onClick={paymentSubmit}>
        <h5 className="text-white text-center">Go to Payment</h5>
      </div>
    </div>
  );
};

// ================= SHIPPING INFO =================
const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
}) => {
  return (
    <div className="w-full bg-white p-5 rounded-md shadow-md">
      <h5 className="text-[18px] font-[500]">Shipping Address</h5>

      <form className="mt-4 space-y-4">
        {/* Name + Email */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm">Full Name</label>
            <input
              value={user?.name || ""}
              type="text"
              readOnly // ✅ not editable, avoid warning
              className={`${styles.input} w-full bg-gray-100 cursor-not-allowed`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Email</label>
            <input
              value={user?.email || ""}
              type="email"
              readOnly
              className={`${styles.input} w-full bg-gray-100 cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Phone + Zip */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm">Phone Number</label>
            <input
              value={user?.phoneNumber || ""}
              type="number"
              readOnly
              className={`${styles.input} w-full bg-gray-100 cursor-not-allowed`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Zip Code</label>
            <input
              type="number"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              className={`${styles.input} w-full`}
            />
          </div>
        </div>

        {/* Country + City */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm">Country</label>
            <select
              className="w-full border h-[40px] rounded-md px-2"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Choose your country</option>
              {Country.getAllCountries().map((item) => (
                <option key={item.isoCode} value={item.isoCode}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm">City</label>
            <select
              className="w-full border h-[40px] rounded-md px-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Choose your city</option>
              {City.getCitiesOfCountry(country).map((item) => (
                <option key={`${item.name}-${item.stateCode}`} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Address1 + Address2 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm">Address 1</label>
            <input
              type="text"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              placeholder="Street address"
              className={`${styles.input} w-full`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Address 2</label>
            <input
              type="text"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              placeholder="Apartment, suite, etc."
              className={`${styles.input} w-full`}
            />
          </div>
        </div>
      </form>

      {/* Saved addresses toggle */}
      <h5
        className="text-[15px] text-blue-600 cursor-pointer mt-2"
        onClick={() => setUserInfo(!userInfo)}
      >
        Choose from saved address
      </h5>

      {userInfo && (
        <div className="mt-3 space-y-2">
          {user?.addresses?.map((item, index) => (
            <label
              key={index}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="saved-address"
                value={item.addressType}
                onChange={() => {
                  setCountry(item.country);
                  setCity(item.city);
                  setAddress1(item.address1);
                  setAddress2(item.address2);
                  setZipCode(item.zipCode);
                }}
              />
              <span>{item.addressType}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ================= CART DATA =================
const CartData = ({
  handleSubmit,
  subTotalPrice,
  shipping,
  discountPercentage,
  totalPrice,
  couponCode,
  setCouponCode,
}) => {
  return (
    <div className="w-full bg-white rounded-md p-5 shadow-md flex flex-col gap-4">
      <div className="flex justify-between text-sm sm:text-base">
        <h3 className="text-gray-600">Subtotal:</h3>
        <h5 className="font-semibold">${subTotalPrice}</h5>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <h3 className="text-gray-600">Shipping:</h3>
        <h5 className="font-semibold">${shipping}</h5>
      </div>

      <div className="flex justify-between text-sm sm:text-base">
        <h3 className="text-gray-600">Discount:</h3>
        <h5 className="font-semibold">
          - {discountPercentage ? "$" + discountPercentage.toString() : null}
        </h5>
      </div>

      <div className="flex justify-between border-t pt-3 text-sm sm:text-base">
        <h3 className="font-semibold">Total:</h3>
        <h5 className="text-lg font-bold">${totalPrice}</h5>
      </div>

      {/* Coupon form */}
      <form className="flex flex-col sm:flex-row gap-3 mt-2" onSubmit={handleSubmit}>
        <input
          type="text"
          className={`${styles.input} flex-1 h-[40px]`}
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button
          type="submit"
          className="h-[40px] px-4 bg-[#f63b60] text-white rounded-md hover:bg-[#d53050]"
        >
          Apply
        </button>
      </form>
    </div>
  );
};

export default CheckOut;