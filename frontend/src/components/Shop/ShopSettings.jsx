import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineCamera } from "react-icons/ai";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { backend_url, server } from "../../server";
import Swal from "sweetalert2";

const ShopSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller?.name || "");
  const [description, setDescription] = useState(seller?.description || "");
  const [address, setAddress] = useState(seller?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(seller?.phoneNumber || "");
  const [zipCode, setZipcode] = useState(seller?.zipCode || "");

  const dispatch = useDispatch();

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file); // field name must match upload.single("image")

    try {
      const res = await axios.put(
        `${server}/api/v2/shop/update-shop-avatar`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      console.log("Updated seller:", res.data); // debug log
      dispatch(loadSeller());
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Avatar updated successfully!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Update failed",
        confirmButtonText: "OK",
      });
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    await axios
      .put(
        `${server}/api/v2/shop/update-seller-info`,
        { name, address, zipCode, phoneNumber, description },
        { withCredentials: true },
      )
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Shop info updated successfully!",
          timer: 3000,
          showConfirmButton: false,
        });
        dispatch(loadSeller());
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error.response?.data?.message || "Update failed",
          confirmButtonText: "OK",
        });
      });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white shadow rounded-lg p-6">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={`${backend_url}/${seller.avatar}`}
              alt="Shop Avatar"
              className="w-[150px] h-[150px] rounded-full object-cover"
            />
            <div className="w-[35px] h-[35px] bg-gray-200 rounded-full flex items-center justify-center cursor-pointer absolute bottom-2 right-2">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image" className="cursor-pointer">
                <AiOutlineCamera />
              </label>
            </div>
          </div>
        </div>

        {/* Shop Form */}
        <form
          aria-required={true}
          className="w-full max-w-[600px] flex flex-col gap-6"
          onSubmit={updateHandler}
        >
          {/* Shop Name */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Shop Name</label>
            <input
              type="text"
              placeholder={seller?.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Shop Description */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              Shop Description
            </label>
            <input
              type="text"
              placeholder={seller?.description || "Enter your shop description"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Shop Address */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              Shop Address
            </label>
            <input
              type="text"
              placeholder={seller?.address}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Shop Phone Number */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              Shop Phone Number
            </label>
            <input
              type="number"
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Shop Zip Code */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              Shop Zip Code
            </label>
            <input
              type="number"
              placeholder={seller?.zipCode}
              value={zipCode}
              onChange={(e) => setZipcode(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <input
              type="submit"
              value="Update Shop"
              className="bg-blue-600 text-white px-6 py-2 rounded-md cursor-pointer w-[80%] max-w-[200px] text-center"
              readOnly
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
