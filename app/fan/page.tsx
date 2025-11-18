import React from "react";
import TopLeague from "../components/TopLeague";
import Live from "../components/Live";
import SideNews from "../components/SideNews";

const page = () => {
  return (
    <div className="mt-10 flex gap-2 px-5 sm:px-15 lg:px-44">
      <TopLeague />
      <Live />
      <SideNews />
    </div>
  );
};

export default page;
