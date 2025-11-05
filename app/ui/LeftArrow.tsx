import React from "react";
import { FaAngleLeft } from "react-icons/fa";

const LeftArrow = ({ padding }: { padding?: string }) => {
  const paddingClass = padding ? `p-${padding}` : "p-2";

  return (
    <p className={`dark:bg-dark-4 rounded-full ${paddingClass}`}>
      <FaAngleLeft />
    </p>
  );
};

export default LeftArrow;
