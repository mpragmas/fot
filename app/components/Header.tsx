"use client";

import { IoMdSettings } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";
import Link from "next/link";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="text-dark bg-whitish dark:bg-dark-1 dark:text-whitish flex items-center justify-between px-5 py-3 font-extrabold sm:px-15 lg:px-44 lg:py-4">
      <div className="flex items-center gap-20">
        <Link href="/" className="text-lg lg:text-2xl">
          FotMob
        </Link>
        <div className="relative font-normal">
          <IoSearch className="text-dark-3 absolute top-2.5 left-3 hidden text-xl lg:block" />

          <input
            placeholder="Search"
            className="bg-light-1 dark:bg-dark-2 hidden rounded-3xl px-10 py-2 outline-none placeholder:text-sm focus:placeholder:opacity-0 lg:block"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 lg:gap-10">
        <p className="hidden lg:block">News</p>
        <p className="hidden lg:block">About us</p>
        <IoSearch className="text-xl lg:hidden" />
        <button onClick={toggleDarkMode} className="cursor-pointer">
          {darkMode ? (
            <IoSunny className="text-xl" />
          ) : (
            <IoMoon className="text-xl" />
          )}
        </button>
        <IoMdSettings className="text-xl" />
      </div>
    </header>
  );
};

export default Header;
