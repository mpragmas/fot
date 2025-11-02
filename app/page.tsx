import League from "./components/League";
import Live from "./components/Live";
import PremierLeaguePage from "./components/PremierLeague";
import SideNews from "./components/SideNews";

export default function Home() {
  return (
    <>
      <div className="mt-10 flex gap-2 px-5 sm:px-15 lg:px-20">
        <League />
        <Live />
        <SideNews />
      </div>
      <PremierLeaguePage />
    </>
  );
}
