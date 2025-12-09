import React from "react";
import SideBar from "../_components/SideBar";
import DashHeader from "../_components/DashHeader";
import { IoHome, IoPersonSharp } from "react-icons/io5";
import { GrNotes } from "react-icons/gr";

const nav = [
  {
    name: "Dashboard",
    href: "/dashboard/reporter",
    icon: <IoHome />,
  },
  {
    name: "Players and Coaches",
    href: "/dashboard/reporter/players_coaches",
    icon: <GrNotes />,
  },
  {
    name: "Transfers",
    href: "/dashboard/reporter/transfers",
    icon: <IoPersonSharp />,
  },
  {
    name: "Matches",
    href: "/dashboard/reporter/matches",
    icon: <IoPersonSharp />,
  },
  {
    name: "News Articles",
    href: "/dashboard/reporter/news",
    icon: <GrNotes />,
  },
  {
    name: "Profile",
    href: "/dashboard/reporter/profile",
    icon: <IoPersonSharp />,
  },
];

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar: sticky on the left */}
      <div className="sticky top-0 h-screen">
        <SideBar nav={nav} />
      </div>

      {/* Right side: header sticky at top, children scrollable */}
      <div className="text-dark bg-whitish flex min-h-screen flex-1 flex-col">
        <div className="bg-whitish sticky top-0 z-10">
          <DashHeader />
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default layout;
