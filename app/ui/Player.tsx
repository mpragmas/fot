import React from "react";

const Player = ({
  name,
  rating,
  image,
}: {
  name: string;
  rating: string;
  image: string;
}) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {/* <img
          src={image}
          alt={name}
          className="h-12 w-12 rounded-full border-2 border-gray-600"
        /> */}
        <p className="h-12 w-12 rounded-full border-2 border-gray-600"></p>
        <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-1.5 py-0.5 text-xs font-semibold">
          {rating}
        </span>
      </div>
      <span className="mt-1 text-xs whitespace-nowrap">{name}</span>
    </div>
  );
};

export default Player;
