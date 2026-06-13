import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardHero from "../../components/Shop/DashboardHero";
import DashboardSidebar from "../../components/Shop/Layout/DashboardSidebar";

function ShopDashboardPage() {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[330px]">
          <DashboardSidebar active={1} />
        </div>
        <div className="flex-1">
          <DashboardHero />
        </div>
      </div>
    </div>
  );
}

export default ShopDashboardPage;