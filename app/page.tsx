import Live from "./components/Live";

import SideNews from "./components/SideNews";
import TopLeague from "./components/TopLeague";

export default function Home() {
  return (
    <div className="mt-10 flex gap-2 px-5 sm:px-15 lg:px-20">
      <TopLeague />
      <Live />
      <SideNews />
    </div>
  );
}
