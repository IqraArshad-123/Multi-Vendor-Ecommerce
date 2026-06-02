// import React, { useEffect, useState } from "react";
// import Header from "../components/Layout/Header";
// import Footer from "../components/Layout/Footer";
// import ProductDetails from "../components/Products/ProductDetails.jsx";
// import { useParams } from "react-router-dom";
// import { productData } from "../static/data.js";
// import SuggestedProduct from "../components/Products/SuggestedProduct.jsx";
// import { useSelector } from "react-redux";

// const ProductDetailsPage = () => {
//     const { allProducts } = useSelector((state) => state.products)


//   const { id } = useParams();
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const data = allProducts.find((i) => i._id === id);
//     setData(data);
//   }, [data]);
//   return (
//     <div>
//       <Header />
//       <ProductDetails data={data} />
//       {data && <SuggestedProduct data={data} />}
//       <Footer />
//     </div>
//   );
// };

// export default ProductDetailsPage;


import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import ProductDetails from "../components/Products/ProductDetails.jsx";
import { useParams } from "react-router-dom";
import SuggestedProduct from "../components/Products/SuggestedProduct.jsx";
import { useSelector } from "react-redux";

const ProductDetailsPage = () => {
  const { allProducts } = useSelector((state) => state.products);
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (allProducts) {
      const product = allProducts.find((i) => i._id === id);
      setData(product);
    }
  }, [allProducts, id]); 

  return (
    <div>
      <Header />
      {data ? (
        <>
          <ProductDetails data={data} />
          <SuggestedProduct data={data} />
        </>
      ) : (
        <div className="text-center my-10">Loading Product Details...</div>
      )}
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;