import React from "react";

type Event = {
  minute: string;
  type: "goal" | "yellow" | "sub";
  player: string;
  assist?: string;
  side: "home" | "away";
  subIn?: string;
  subOut?: string;
  note?: string;
};

const EventIcon: React.FC<{ type: Event["type"] }> = ({ type }) => (
  <span className="text-lg">{icon(type)}</span>
);

const NonSubHome: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <div>
      <p className="text-dark dark:text-whitish inline-flex items-center gap-2 font-medium">
        {e.player}
      </p>
      {e.assist && <p className="text-xs">assist by {e.assist}</p>}
    </div>
    <EventIcon type={e.type} />
  </div>
);

const NonSubAway: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <EventIcon type={e.type} />
    <div>
      <p className="text-dark dark:text-whitish inline-flex items-center gap-2 font-medium">
        {e.player}
      </p>
      {e.assist && <p className="text-xs">assist by {e.assist}</p>}
    </div>
  </div>
);

const SubHome: React.FC<{ e: Event }> = ({ e }) => (
  <div>
    <EventIcon type="sub" />
    <p>
      <span className="inline-flex items-center gap-1 text-green-400">
        {e.subIn}
      </span>
      <span className="inline-flex items-center gap-1 text-red-400">
        {e.subOut}
      </span>
    </p>
  </div>
);

const SubAway: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <EventIcon type="sub" />
    <p className="flex flex-col">
      <span className="inline-flex items-center gap-1 text-green-400">
        {e.subIn}
      </span>
      <span className="inline-flex items-center gap-1 text-red-400">
        {e.subOut}
      </span>
    </p>
  </div>
);

const events: Event[] = [
  { minute: "15", type: "yellow", player: "Daniel Svensson", side: "away" },
  {
    minute: "22",
    type: "goal",
    player: "Phil Foden (1 - 0)",
    assist: "Tijjani Reijnders",
    side: "home",
  },
  {
    minute: "29",
    type: "goal",
    player: "Erling Haaland (2 - 0)",
    assist: "Jérémy Doku",
    side: "home",
  },
  {
    minute: "+2",
    type: "goal",
    player: "",
    side: "home",
    note: "+2 minutes added",
  },
  { minute: "HT", type: "goal", player: "HT 2 - 0", side: "home" },
  {
    minute: "57",
    type: "goal",
    player: "Phil Foden (3 - 0)",
    assist: "Tijjani Reijnders",
    side: "home",
  },
  {
    minute: "66",
    type: "sub",
    player: "",
    subIn: "Pascal Gross",
    subOut: "Marcel Sabitzer",
    side: "away",
  },
  {
    minute: "66",
    type: "sub",
    player: "",
    subIn: "Carney Chukwuemeka",
    subOut: "Serhou Guirassy",
    side: "away",
  },
  {
    minute: "66",
    type: "sub",
    player: "",
    subIn: "Emre Can",
    subOut: "Ramy Bensebaïni",
    side: "away",
  },
  {
    minute: "66",
    type: "sub",
    player: "",
    subIn: "Jobe Bellingham",
    subOut: "Maximilian Beier",
    side: "away",
  },
  {
    minute: "72",
    type: "goal",
    player: "Waldemar Anton (3 - 1)",
    assist: "Julian Ryerson",
    side: "away",
  },
  { minute: "78", type: "yellow", player: "Savinho", side: "home" },
];

const icon = (type: Event["type"]) => {
  switch (type) {
    case "goal":
      return "⚽";
    case "yellow":
      return "🟨";
    case "sub":
      return "🔄";
    default:
      return "";
  }
};

const MatchEvents: React.FC = () => {
  return (
    <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 flex justify-center rounded-2xl p-6">
      <div className="w-full max-w-3xl rounded-2xl p-6 shadow-lg">
        <h2 className="mb-4 text-center text-lg font-semibold">Events</h2>

        <div className="">
          {events.map((e, i) => (
            <div key={i}>
              {e.note ? (
                <div className="my-3 flex justify-center text-sm italic">
                  {e.note}
                </div>
              ) : e.minute === "HT" ? (
                <div className="my-4 flex items-center justify-center gap-2">
                  <div className="h-[1px] flex-1 bg-gray-700"></div>
                  <span className="text-sm">{e.player}</span>
                  <div className="h-[1px] flex-1 bg-gray-700"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 items-center py-2 text-sm">
                  {/* Home side */}
                  {e.side === "home" ? (
                    <div className="flex justify-end pr-4 text-right">
                      <div>
                        {e.type === "sub" ? (
                          <SubHome e={e} />
                        ) : (
                          <NonSubHome e={e} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  {/* Center minute + icon */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="dark:bg-dark-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                      {e.minute}’
                    </div>
                  </div>

                  {/* Away side */}
                  {e.side === "away" ? (
                    <div className="flex justify-start pl-4">
                      <div>
                        {e.type === "sub" ? (
                          <SubAway e={e} />
                        ) : (
                          <NonSubAway e={e} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchEvents;
