import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSidebar from "../../components/Shop/Layout/DashboardSidebar";
import ShopSettings from "../../components/Shop/ShopSettings";

const ShopSettingsPage = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <DashboardHeader />

      <div className="flex w-full flex-1">
        {/* Sidebar (full height) */}
        <div className="w-[80px] 800px:w-[330px] bg-white shadow-md min-h-screen">
          <DashboardSidebar active={11} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <ShopSettings />
        </div>
      </div>
    </div>
  );
};

export default ShopSettingsPage;