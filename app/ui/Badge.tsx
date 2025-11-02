import React from "react";

const Badge = ({ v }: { v: string }) => {
  const color =
    v === "W" ? "bg-green-2" : v === "D" ? "bg-dark-5" : "bg-red-500";
  return (
    <span
      className={`${color} text-whitish inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold`}
    >
      {v}
    </span>
  );
};

export default Badge;
