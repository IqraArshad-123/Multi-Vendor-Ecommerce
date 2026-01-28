import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSidebar from '../../components/Shop/Layout/DashboardSidebar'
import CreateProduct from '../../components/Shop/CreateProduct.jsx';

const ShopCreateProduct = () => {
  return (
    <div>
        <DashboardHeader/>
        <div className="flex items-center justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSidebar active={4} />
        </div>
        <div className="flex justify-center w-full">
            <CreateProduct/>
        </div>
      </div>
    </div>
  )
}

export default ShopCreateProduct