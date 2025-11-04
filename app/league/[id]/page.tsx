import Table from "../_components/Table";
import Matches from "../_components/Matches";
import TeamFormation from "../_components/TeamFormation";
import TopStats from "@/app/components/TopStats";
import NewsSection from "@/app/components/NewsSection";

const players = [
  { name: "Djihad Bizimana", rating: "8.5", image: "" },
  { name: "Ange Mutsinzi", rating: "8.3", image: "" },
  { name: "Fiacre Ntwari", rating: "8.2", image: "" },
  { name: "Bonheur Mugisha", rating: "8.1", image: "" },
  { name: "Emmanuel Imanishimwe", rating: "8.0", image: "" },
  { name: "Thierry Manzi", rating: "7.9", image: "" },
  { name: "Jojea Kwizera", rating: "7.9", image: "" },
  { name: "Hakim Sahabo", rating: "7.8", image: "" },
  { name: "Innocent Nshuti", rating: "7.7", image: "" },
  { name: "Fitina Omborenga", rating: "7.6", image: "" },
  { name: "Kevin Muhire", rating: "7.6", image: "" },
];

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

export default function Overview({ params }: { params: { id: string } }) {
  return (
    <div className="mt-7 w-full">
      <Matches />
      <div className="mt-5 flex gap-3">
        <div className="w-[70%]">
          <Table />
          <TopStats />
          <NewsSection items={newsItems} />
        </div>
        <div className="w-[30%]">
          <TeamFormation formation={[4, 2, 3, 1]} players={players} />
        </div>
      </div>
    </div>
  );
}
