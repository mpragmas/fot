import React from "react";
import { FaAngleRight } from "react-icons/fa";
import Link from "next/link";

type RightArrowProps = { padding?: string; href?: string; disabled?: boolean };

const RightArrow = ({ padding, href, disabled }: RightArrowProps) => {
  const paddingClass = padding ? `p-${padding}` : "p-2";

  return (
    <>
      {href && !disabled ? (
        <Link
          href={href}
          className={`dark:bg-dark-4 rounded-full ${paddingClass}`}
        >
          <FaAngleRight />
        </Link>
      ) : (
        <p
          className={`rounded-full ${paddingClass} bg-dark-2 cursor-default text-gray-500`}
        >
          <FaAngleRight />
        </p>
      )}
    </>
  );
};

export default RightArrow;
