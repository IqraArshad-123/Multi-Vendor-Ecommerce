import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData } from "../../static/data";

const DropDown = ({setDropDown}) => {
  const navigate = useNavigate();
  const submitHandle = (i) => {
    navigate(`/products?category=${i.title}`);
    setDropDown(false);
    window.location.reload();
  };
  return (
    <div>
      <div className="pb-4 w-[270px] bg-white absolute top-full left-0 z-30 rounded-b-md shadow-sm">
        {/* Scrollable List */}
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {categoriesData &&
            categoriesData.map((i, index) => (
              <div
                key={index}
                className={`flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer`}
                onClick={() => submitHandle(i)}
              >
                <img
                  src={i.image_Url}
                  alt={i.title}
                  style={{
                    width: "25px",
                    height: "25px",
                    objectFit: "contain",
                    userSelect: "none",
                    marginLeft: "10px",
                  }}
                />
                <h3 className="m-3 select-none cursor-pointer">{i.title}</h3>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DropDown;
