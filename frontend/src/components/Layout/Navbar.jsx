import React from "react";
import { navItems } from "../../static/data";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";

const Navbar = ({active}) => {
  return (
    <div className={`block 800px:${styles.noramlFlex}`}>
      {navItems &&
        navItems.map((i, index) => (
          <div className="flex" key={index}>
            <Link
              to={i.url}
              className={`${
                active === index + 1
                  ? "text-[#17dd1f]"
                  : "text-black md:text-[#fff]"
              } font-[500] px-6 pb-[30px] md:pb-0 cursor-pointer`}
            >
              {i.title}
            </Link>
          </div>
        ))}
    </div>
  );
};

export default Navbar;
