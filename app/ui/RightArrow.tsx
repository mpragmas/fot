import React from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const RightArrow = ({ padding }: { padding?: string }) => {
  const paddingClass = padding ? `p-${padding}` : "p-2";

  return (
    <p className={`dark:bg-dark-4 rounded-full ${paddingClass}`}>
      <FaAngleRight />
    </p>
  );
};

export default RightArrow;
