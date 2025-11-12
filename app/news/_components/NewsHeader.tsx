import React from "react";

const NewsHeader = ({
  item,
}: {
  item: { id: number; title: string; source: string; img: string };
}) => {
  return (
    <div className="dark:border-dark-0 flex items-center gap-3 border-b pb-4">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-black">
        {item.id}
      </div>
      <div className="flex-1">
        <p className="text-sm leading-tight font-medium">{item.title}</p>
        <p className="text-xs text-gray-400">{item.source}</p>
      </div>
      <img
        src={item.img}
        alt="thumb"
        className="h-20 w-27 rounded-md object-cover"
      />
    </div>
  );
};

export default NewsHeader;
