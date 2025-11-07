import React from "react";
import Image from "next/image";

interface NewsItem {
  title: string;
  source: string;
  time: string;
  image: string;
}

interface NewsSectionProps {
  items: NewsItem[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ items }) => {
  return (
    <div className="dark:bg-dark-1 bg-whitish dark:text-whitish mt-5 w-full rounded-xl p-5">
      <h2 className="mb-4 text-lg font-semibold">News</h2>
      <div className="t grid grid-cols-1 md:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg p-3 transition"
          >
            <div className="flex flex-col">
              <h3 className="text-sm leading-snug font-medium">{item.title}</h3>
              <p className="dark:text-dark-3 mt-1 text-xs font-light">
                {item.source} · {item.time}
              </p>
            </div>
            <Image
              src={item.image}
              alt={item.title}
              className="h-25 w-25 flex-shrink-0 rounded-md object-cover"
              width={100}
              height={100}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button className="dark:text-dark-3 text-sm">See more</button>
      </div>
    </div>
  );
};

export default NewsSection;
