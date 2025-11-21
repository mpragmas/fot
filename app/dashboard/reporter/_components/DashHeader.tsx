import React from "react";
import { BsLayoutSidebar } from "react-icons/bs";
const DashHeader = () => {
  return (
    <header className="text-dark flex w-full items-center justify-between border-b border-[#E5E7EB] px-8 py-4 pb-4">
      <h2 className="text-gray-1 flex items-center gap-2 text-xl font-bold">
        <span className="">
          <BsLayoutSidebar />
        </span>
        Reporter Dashboard
      </h2>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-base font-semibold">Dushime Egide</p>
          <p className="text-xs text-gray-500">Kigali, Rwanda</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gray-300" />
        <button className="rounded border border-[#E5E7EB] px-4 py-2 font-bold hover:bg-gray-300">
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashHeader;
