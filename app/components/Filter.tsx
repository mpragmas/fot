import React, { useMemo, useRef } from "react";
import { FaSortDown } from "react-icons/fa";
import LeftArrow from "../ui/LeftArrow";
import RightArrow from "../ui/RightArrow";
import { MdFilterList } from "react-icons/md";

type StatusFilter = "ALL" | "ONGOING";

type FilterProps = {
  date: Date;
  onPrevDate: () => void;
  onNextDate: () => void;
  onDateChange: (date: Date) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

const Filter = ({
  date,
  onPrevDate,
  onNextDate,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
}: FilterProps) => {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const formattedDate = useMemo(() => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  const handleSelectDate: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.value) return;
    const next = new Date(e.target.value + "T00:00:00");
    onDateChange(next);
  };

  const isOngoingActive = statusFilter === "ONGOING";

  return (
    <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl">
      <div className="flex justify-between p-3">
        <button onClick={onPrevDate} type="button">
          <LeftArrow />
        </button>
        <button
          type="button"
          className="flex items-center gap-2"
          onClick={() => {
            if (dateInputRef.current) {
              // Prefer showPicker when available for immediate calendar display
              // @ts-ignore - showPicker is not yet in TypeScript's lib DOM
              if (dateInputRef.current.showPicker) {
                dateInputRef.current.showPicker();
              } else {
                dateInputRef.current.focus();
              }
            }
          }}
        >
          <span>{formattedDate}</span>
          <FaSortDown className="self-start" />
        </button>
        <button onClick={onNextDate} type="button">
          <RightArrow />
        </button>
      </div>
      <p className="border-light-2 dark:border-dark-0 w-full border-[0.2px]"></p>
      <div className="flex items-center justify-between gap-5 p-3">
        <div className="space-x-3">
          <button
            type="button"
            onClick={() =>
              onStatusFilterChange(isOngoingActive ? "ALL" : "ONGOING")
            }
            className={`dark:bg-dark-4 dark:text-whitish inline rounded-2xl px-5 py-1 text-xs`}
          >
            Ongoing
          </button>
        </div>
        <div className="relative font-normal">
          <MdFilterList className="text-dark-3 absolute top-2 left-3 text-xl" />

          <input
            placeholder="Search"
            className="bg-light-1 dark:bg-dark-2 hidden rounded-3xl py-1 pr-15 pl-10 outline-none placeholder:text-sm focus:placeholder:opacity-0 lg:block"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <input
        ref={dateInputRef}
        type="date"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        onChange={handleSelectDate}
        value={`${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`}
      />
    </div>
  );
};

export default Filter;
