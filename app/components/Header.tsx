import { IoMdSettings } from "react-icons/io";
import { IoSearch } from "react-icons/io5";

const Header = () => {
  return (
    <header className="text-whitish bg-light flex items-center justify-between px-5 py-2 font-extrabold sm:px-15 lg:px-20 lg:py-4">
      <div className="flex items-center gap-20">
        <h1 className="text-lg lg:text-2xl">FotMob</h1>
        <div className="hidden font-normal lg:relative">
          <IoSearch className="text-lightest absolute top-2.5 left-3 text-xl" />

          <input
            placeholder="Search"
            className="bg-light-dark hidden rounded-3xl px-10 py-2 outline-none placeholder:text-sm focus:placeholder:opacity-0 lg:block"
          />
        </div>
      </div>
      <div className="flex items-center gap-10">
        <p className="hidden lg:block">News</p>
        <p className="hidden lg:block">About us</p>
        <IoMdSettings />
      </div>
    </header>
  );
};

export default Header;
