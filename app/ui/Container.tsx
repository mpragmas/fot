import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-10 px-5 sm:px-15 lg:px-20">{children}</div>;
};

export default Container;
