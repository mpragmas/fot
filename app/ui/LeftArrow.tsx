import React from "react";
import { FaAngleLeft } from "react-icons/fa";
import Link from "next/link";

type LeftArrowProps = { padding?: string; href?: string; disabled?: boolean };

const LeftArrow = ({ padding, href, disabled }: LeftArrowProps) => {
  const paddingClass = padding ? `p-${padding}` : "p-2";

  return (
    <>
      {href && !disabled ? (
        <Link
          href={href}
          className={`dark:bg-dark-4 rounded-full ${paddingClass}`}
        >
          <FaAngleLeft />
        </Link>
      ) : (
        <p
          className={`rounded-full ${paddingClass} bg-dark-2 cursor-default text-gray-500`}
        >
          <FaAngleLeft />
        </p>
      )}
    </>
  );
};

export default LeftArrow;
