import React from "react";
import SideBar from "./_components/SideBar";
import DashHeader from "./_components/DashHeader";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />
      <div className="tex-dark bg-whitish flex-1">
        <DashHeader />
        {children}
      </div>
    </div>
  );
};

export default layout;
