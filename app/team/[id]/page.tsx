import TopStats from "@/app/components/TopStats";
import React from "react";
import NewsSection from "@/app/components/NewsSection";
import Table from "@/app/league/_components/Table";
import MatchInfo from "../_components/TeamForm";
import NextMatch from "../_components/NextMatch";
import TeamForm from "../_components/TeamForm";
import TeamFixtures from "../_components/TeamFixtures";

const newsItems = [
  {
    title:
      "ANOTHER CLEAN SHEET & ANOTHER SET PIECE GOAL | EXTENDED HIGHLIGHTS | Burnley vs Arsenal | PL",
    source: "YouTube",
    time: "8 hours ago",
    image: "https://i.ytimg.com/vi/someimg1.jpg",
  },
  {
    title:
      "We Take A Point 🤝 | Nottingham Forest 2-2 Man Utd | Extended Highlights",
    source: "YouTube",
    time: "8 hours ago",
    image: "https://i.ytimg.com/vi/someimg2.jpg",
  },
  {
    title: "Defeat in the capital | Fulham 3-0 Wolves | Extended Highlights",
    source: "YouTube",
    time: "8 hours ago",
    image: "https://i.ytimg.com/vi/someimg3.jpg",
  },
  {
    title:
      "'He leads by example' – Le Bris hails Xhaka for huge impact on Sunderland",
    source: "FotMob",
    time: "9 hours ago",
    image: "https://i.ytimg.com/vi/someimg4.jpg",
  },
  {
    title:
      "Antoine Semenyo Responds Directly to Premier League Transfer Speculation",
    source: "SI",
    time: "9 hours ago",
    image: "https://i.ytimg.com/vi/someimg5.jpg",
  },
  {
    title: "West Ham 3-1 Newcastle United | Premier League Highlights",
    source: "YouTube",
    time: "10 hours ago",
    image: "https://i.ytimg.com/vi/someimg6.jpg",
  },
  {
    title:
      "HIGHLIGHTS! Man City 3-1 Bournemouth | City move second with entertaining Bournemouth win!",
    source: "YouTube",
    time: "10 hours ago",
    image: "https://i.ytimg.com/vi/someimg7.jpg",
  },
  {
    title: "Forget Alexander Isak, Newcastle Have Moved on With Nick Woltemade",
    source: "SI",
    time: "10 hours ago",
    image: "https://i.ytimg.com/vi/someimg8.jpg",
  },
];

const Team = () => {
  return (
    <div className="mt-7 w-full">
      <div className="mt-5 flex">
        <div className="w-[70%]">
          <div className="flex w-full items-center justify-center bg-black font-sans text-white">
            <div className="flex w-full gap-4">
              <TeamForm />
              <NextMatch />
            </div>
          </div>

          <Table />
          <TopStats />
          <NewsSection items={newsItems} />
        </div>
        <div className="w-[30%]">
          <TeamFixtures />
        </div>
      </div>
    </div>
  );
};

export default Team;
