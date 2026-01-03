import React from "react";

const LineupReport = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-[#326744]/30 p-4 pb-2">
        <h3 className="text-lg font-bold">Manage Lineups</h3>
        <div className="flex rounded-lg bg-[#23482f] p-1">
          <button className="bg-primary rounded-md px-3 py-1.5 text-xs font-bold text-[#112217] shadow-sm">
            Home
          </button>
          <button className="px-3 py-1.5 text-xs font-bold text-[#92c9a4] transition-colors hover:text-white">
            Away
          </button>
        </div>
      </div>
      <div className="flex gap-6 border-b border-[#326744]/30 px-4 pt-2">
        <button className="text-primary border-primary border-b-2 pb-2 text-sm font-bold">
          Starting XI
        </button>
        <button className="pb-2 text-sm font-bold text-[#92c9a4] transition-colors hover:text-white">
          Bench
        </button>
        <button className="pb-2 text-sm font-bold text-[#92c9a4] transition-colors hover:text-white">
          Missing
        </button>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="focus:ring-primary h-10 w-full rounded-lg border-none bg-[#23482f] px-2 text-center text-sm text-white placeholder-[#92c9a4] focus:ring-2 sm:w-16"
            placeholder="#"
            type="number"
          />
          <input
            className="focus:ring-primary h-10 flex-1 rounded-lg border-none bg-[#23482f] px-3 text-sm text-white placeholder-[#92c9a4] focus:ring-2"
            placeholder="Player Name"
            type="text"
          />
          <select className="focus:ring-primary h-10 w-full rounded-lg border-none bg-[#23482f] px-2 text-sm text-white focus:ring-2 sm:w-24">
            <option value="GK">GK</option>
            <option value="DF">DF</option>
            <option value="MF">MF</option>
            <option value="FW">FW</option>
          </select>
          <button className="bg-primary flex h-10 w-full items-center justify-center rounded-lg text-[#112217] transition-colors hover:bg-[#23ee6c] sm:w-12">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="group/player flex items-center justify-between rounded-lg border border-[#23482f] bg-[#23482f]/50 p-2 transition-colors hover:bg-[#23482f]">
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/20 flex h-6 w-6 items-center justify-center rounded border bg-[#23482f] text-xs font-bold">
                1
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  David De Gea
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#92c9a4] uppercase">
                  Goalkeeper
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/player:opacity-100">
              <button className="rounded-md p-1.5 text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white">
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
              <button className="rounded-md p-1.5 text-[#92c9a4] transition-colors hover:bg-red-400/10 hover:text-red-400">
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
              </button>
            </div>
          </div>
          <div className="group/player flex items-center justify-between rounded-lg border border-[#23482f] bg-[#23482f]/50 p-2 transition-colors hover:bg-[#23482f]">
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/20 flex h-6 w-6 items-center justify-center rounded border bg-[#23482f] text-xs font-bold">
                8
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  Bruno Fernandes
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#92c9a4] uppercase">
                  Midfielder
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/player:opacity-100">
              <button className="rounded-md p-1.5 text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white">
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
              <button className="rounded-md p-1.5 text-[#92c9a4] transition-colors hover:bg-red-400/10 hover:text-red-400">
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
              </button>
            </div>
          </div>
          <div className="group/player flex items-center justify-between rounded-lg border border-[#23482f] bg-[#23482f]/50 p-2 transition-colors hover:bg-[#23482f]">
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/20 flex h-6 w-6 items-center justify-center rounded border bg-[#23482f] text-xs font-bold">
                10
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  Marcus Rashford
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#92c9a4] uppercase">
                  Forward
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/player:opacity-100">
              <button className="rounded-md p-1.5 text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white">
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
              <button className="rounded-md p-1.5 text-[#92c9a4] transition-colors hover:bg-red-400/10 hover:text-red-400">
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center border-t border-[#326744]/30 pt-2 sm:justify-end">
          <button className="hover:text-primary flex items-center gap-1 text-xs font-bold text-[#92c9a4] transition-colors">
            View Full Squad{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineupReport;
