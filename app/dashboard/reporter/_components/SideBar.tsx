import React from "react";
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
    href: "/dashboard/reporter/players-and-coaches",
    icon: <GrNotes />,
  },
  {
    name: "Transfers",
    href: "/dashboard/reporter/transfers",
    icon: <IoPersonSharp />,
  },
  {
    name: "News Articles",
    href: "/dashboard/reporter/news-articles",
    icon: <GrNotes />,
  },
  {
    name: "Profile",
    href: "/dashboard/reporter/profile",
    icon: <IoPersonSharp />,
  },
];

const SideBar = () => {
  return (
    <aside className="text-dark bg-light-0 border-gray-2 border-r px-6 py-3">
      <div className="mb-8 flex items-center gap-2">
        <p className="bg-gray-2 p-5"></p>
        <div className="">
          <h1 className="text-xl font-semibold">Rwanda Football</h1>
          <p className="text-gray-1 text-sm font-medium">Reporter console</p>
        </div>
      </div>

      <p className="text-gray-1 mb-4 text-xs font-semibold">Navigation</p>
      <nav className="space-y-2">
        {nav.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="hover:bg-gray-2/50 flex items-center gap-2 p-2 transition-colors"
          >
            <span className="">{item.icon}</span> {item.name}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar;
