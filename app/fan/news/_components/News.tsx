import React from "react";
import NewsHeader from "./NewsHeader";

const trending = [
  {
    id: 1,
    title: "Spain boss De la Fuente shocked by Yamal procedure",
    source: "FotMob · 3 hours ago",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT7trOX4jgov-kHPppovEwbcRGUy0rUNowyQ&s",
  },
  {
    id: 2,
    title:
      "Liverpool Star’s ‘Problems’ Flagged After Repeated International Snubs",
    source: "SI · 3 hours ago",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT7trOX4jgov-kHPppovEwbcRGUy0rUNowyQ&s",
  },
  {
    id: 3,
    title: "The Surprise Truth Behind Lionel Messi’s Camp Nou Return",
    source: "SI · 3 hours ago",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT7trOX4jgov-kHPppovEwbcRGUy0rUNowyQ&s",
  },
  {
    id: 4,
    title:
      "Cristiano Ronaldo Drops Huge Retirement Bombshell Ahead of 2026 World Cup",
    source: "SI · 36 minutes ago",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT7trOX4jgov-kHPppovEwbcRGUy0rUNowyQ&s",
  },
];

const News = () => {
  return (
    <div className="dark:bg-dark-1 rounded-2xl px-4 py-6 text-white">
      {/* Main large article */}
      <div className="flex gap-5">
        <div className="dark:bg-dark-0 w-1/2 rounded-xl">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT7trOX4jgov-kHPppovEwbcRGUy0rUNowyQ&s"
            alt="Main story"
            className="w-full object-cover"
          />
          <div className="space-y-20 p-4">
            <h1 className="text-2xl font-bold">
              The Premier League’s Best (and Worst) Dressed Managers
            </h1>
            <p className="mt-2 text-sm text-gray-400">SI · 2 hours ago</p>
          </div>
        </div>

        {/* Trending section */}
        <div className="w-1/2 rounded-xl p-4">
          <h2 className="mb-4 text-lg font-semibold">Trending</h2>
          <div className="flex flex-col space-y-4">
            {trending.map((item) => (
              <NewsHeader key={item.id} item={item} />
            ))}
          </div>
          <button className="mt-4 text-sm text-green-400 hover:underline">
            See more →
          </button>
        </div>
      </div>
    </div>
  );
};

export default News;
