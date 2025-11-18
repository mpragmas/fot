import React from "react";

type BadgeType = "goal" | "yellow" | "sub";

type Player = {
  number?: number;
  name: string;
  badges?: BadgeType[];
};

// Tiny SVG icons (keeps design/layout; replaces emoji)
const IconGoal: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-4", className].join(" ")}>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="currentColor"
      className="text-gray-200"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      fill="transparent"
      stroke="#1a1a1a"
      strokeWidth="2"
    />
  </svg>
);

const IconYellow: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-3", className].join(" ")}>
    <rect x="5" y="3" width="14" height="18" rx="2" fill="#facc15" />
  </svg>
);

const IconSubIn: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-4", className].join(" ")}>
    <circle cx="12" cy="12" r="10" fill="#16a34a" />
    <path
      d="M8 12h8M12 8l4 4-4 4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSubOut: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-4", className].join(" ")}>
    <circle cx="12" cy="12" r="10" fill="#dc2626" />
    <path
      d="M16 12H8M12 16l-4-4 4-4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShirtNumber: React.FC<{ n: number }> = ({ n }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-200">
    {n}
  </div>
);

const EventIcon: React.FC<{ type: BadgeType }> = ({ type }) => {
  if (type === "goal") return <IconGoal />;
  if (type === "yellow") return <IconYellow />;
  return <IconSubIn />;
};

const Badge: React.FC<{ type: BadgeType }> = ({ type }) => (
  <span className="text-sm leading-none">{<EventIcon type={type} />}</span>
);

const PlayerCell: React.FC<{
  player: Player;
  align?: "left" | "right";
}> = ({ player, align = "left" }) => (
  <div
    className={[
      "flex items-center gap-3 py-3",
      align === "right" ? "justify-end text-right" : "justify-start",
    ].join(" ")}
  >
    {align === "left" && player.number !== undefined && (
      <ShirtNumber n={player.number} />
    )}

    <div className="flex items-center gap-3">
      <p className="text-sm text-gray-200">{player.name}</p>
      <div className="flex items-center gap-2">
        {player.badges?.map((b, i) => (
          <Badge key={i} type={b} />
        ))}
      </div>
    </div>

    {align === "right" && player.number !== undefined && (
      <ShirtNumber n={player.number} />
    )}
  </div>
);

const Row: React.FC<{ left?: Player; right?: Player }> = ({ left, right }) => (
  <div className="grid grid-cols-3 items-center">
    <div>{left && <PlayerCell player={left} align="left" />}</div>
    <div />
    <div>{right && <PlayerCell player={right} align="right" />}</div>
  </div>
);

const arsenal: Player[] = [
  { number: 1, name: "David Raya" },
  { number: 4, name: "Ben White" },
  { number: 2, name: "William Saliba" },
  { number: 6, name: "Gabriel" },
  { number: 35, name: "Oleksandr Zinchenko" },
  { number: 5, name: "Thomas Partey" },
  { number: 8, name: "Martin Ødegaard", badges: ["goal"] },
  { number: 29, name: "Kai Havertz" },
  { number: 7, name: "Bukayo Saka" },
  { number: 9, name: "Gabriel Jesus", badges: ["yellow"] },
  { number: 11, name: "Gabriel Martinelli", badges: ["sub"] },
];

const barcelona: Player[] = [
  { number: 1, name: "Marc-André ter Stegen" },
  { number: 2, name: "João Cancelo" },
  { number: 4, name: "Ronald Araújo" },
  { number: 5, name: "Íñigo Martínez" },
  { number: 3, name: "Alejandro Balde" },
  { number: 22, name: "İlkay Gündoğan" },
  { number: 21, name: "Frenkie de Jong" },
  { number: 15, name: "Andreas Christensen" },
  { number: 27, name: "Lamine Yamal", badges: ["goal"] },
  { number: 9, name: "Robert Lewandowski" },
  { number: 11, name: "Raphinha", badges: ["yellow"] },
];

type SubEvent = { minute: number; out: string; in: string };

// Substitutions from Sporting News match report (Jul 26, 2023)
const arsenalSubs: SubEvent[] = [
  { minute: 46, out: "Kai Havertz", in: "Emile Smith Rowe" },
  { minute: 62, out: "Martin Ødegaard", in: "Fábio Vieira" },
  { minute: 70, out: "William Saliba", in: "Jakub Kiwior" },
  { minute: 70, out: "Jurrien Timber", in: "Kieran Tierney" },
  { minute: 70, out: "Thomas Partey", in: "Jorginho" },
  { minute: 78, out: "Gabriel Jesus", in: "Eddie Nketiah" },
  { minute: 79, out: "Leandro Trossard", in: "Gabriel Martinelli" },
  { minute: 84, out: "Bukayo Saka", in: "Amario Cozier-Duberry" },
];

const barcelonaSubs: SubEvent[] = [
  { minute: 46, out: "Marc-André ter Stegen", in: "Iñaki Peña" },
  { minute: 46, out: "Ronald Araújo", in: "Eric García" },
  { minute: 46, out: "Andreas Christensen", in: "Jules Koundé" },
  { minute: 46, out: "İlkay Gündoğan", in: "Franck Kessié" },
  { minute: 46, out: "Raphinha", in: "Ousmane Dembélé" },
  { minute: 46, out: "Pedri", in: "Frenkie de Jong" },
  { minute: 46, out: "Ez Abde", in: "Ansu Fati" },
  { minute: 46, out: "Sergiño Dest", in: "Fermín López" },
  { minute: 46, out: "Oriol Romeu", in: "Alejandro Balde" },
  { minute: 79, out: "Fermín López", in: "Lamine Yamal" },
];

const arsenalBench: Player[] = [
  { number: 10, name: "Emile Smith Rowe" },
  { number: 21, name: "Fábio Vieira" },
  { number: 15, name: "Jakub Kiwior" },
  { number: 3, name: "Kieran Tierney" },
  { number: 20, name: "Jorginho" },
  { number: 14, name: "Eddie Nketiah" },
  { number: 11, name: "Gabriel Martinelli" },
  { number: 71, name: "Amario Cozier-Duberry" },
];

const barcelonaBench: Player[] = [
  { number: 13, name: "Iñaki Peña" },
  { number: 24, name: "Eric García" },
  { number: 23, name: "Jules Koundé" },
  { number: 19, name: "Franck Kessié" },
  { number: 7, name: "Ousmane Dembélé" },
  { number: 21, name: "Frenkie de Jong" },
  { number: 10, name: "Ansu Fati" },
  { number: 32, name: "Fermín López" },
  { number: 27, name: "Lamine Yamal" },
  { number: 3, name: "Alejandro Balde" },
];

const coaches = {
  arsenal: "Mikel Arteta",
  barcelona: "Xavi Hernández",
};

const MinuteBadge: React.FC<{ m: number }> = ({ m }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-200">
    {m}’
  </div>
);

const SubRow: React.FC<{ left?: SubEvent; right?: SubEvent }> = ({
  left,
  right,
}) => (
  <div className="grid grid-cols-3 items-center gap-2 py-2 text-sm">
    <div className="flex items-center justify-start gap-3">
      {left && (
        <>
          <MinuteBadge m={left.minute} />
          <div className="flex flex-col">
            <span className="dark:text-dark-3 inline-flex items-center gap-2">
              <IconSubOut />
              {left.out}
            </span>
            <span className="dark:text-whitish inline-flex items-center gap-2 font-semibold">
              <IconSubIn />
              {left.in}
            </span>
          </div>
        </>
      )}
    </div>
    <div />
    <div className="flex items-center justify-end gap-3">
      {right && (
        <>
          <div className="flex flex-col text-right">
            <span className="dark:text-dark-3 inline-flex items-center justify-end gap-1">
              {right.out}
              <IconSubOut />
            </span>
            <span className="dark:text-whitish inline-flex items-center justify-end gap-1 font-semibold">
              {right.in}
              <IconSubIn />
            </span>
          </div>
          <MinuteBadge m={right.minute} />
        </>
      )}
    </div>
  </div>
);

const Lineup: React.FC = () => {
  const rows = Math.max(arsenal.length, barcelona.length);

  return (
    <>
      <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 flex w-[70%] justify-center rounded-2xl p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-lg">
          <div className="px-5 py-4">
            <h2 className="mb-2 text-center text-lg font-semibold">
              Arsenal vs Barcelona - Lineups
            </h2>
          </div>

          <div className="divide-y divide-gray-800/60">
            {Array.from({ length: rows }).map((_, i) => (
              <Row key={i} left={arsenal[i]} right={barcelona[i]} />
            ))}
          </div>
        </div>
      </div>

      {/* Substitutions */}
      <div className="dark:bg-dark-1 mt-5 w-[70%] rounded-2xl px-5 py-6">
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Substitutions
        </h3>
        <div className="overflow-hidden rounded-2xl">
          <div className="divide-y divide-gray-800/60 p-3">
            {Array.from({
              length: Math.max(arsenalSubs.length, barcelonaSubs.length),
            }).map((_, i) => (
              <SubRow key={i} left={arsenalSubs[i]} right={barcelonaSubs[i]} />
            ))}
          </div>
        </div>
      </div>

      {/* Substitute Players */}
      <div className="dark:bg-dark-1 mt-5 w-[70%] rounded-2xl px-5 pb-6">
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Substitute Players
        </h3>
        <div className="overflow-hidden rounded-2xl">
          <div className="divide-y divide-gray-800/60 p-3">
            {Array.from({
              length: Math.max(arsenalBench.length, barcelonaBench.length),
            }).map((_, i) => (
              <Row key={i} left={arsenalBench[i]} right={barcelonaBench[i]} />
            ))}
          </div>
        </div>
      </div>
      {/* Coaches */}
      <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 w-[70%] rounded-2xl p-5 pb-8">
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Coaches
        </h3>
        <div className="overflow-hidden rounded-2xl">
          <div className="grid grid-cols-2">
            <div className="p-4 font-semibold">{coaches.arsenal}</div>
            <div className="p-4 text-right font-semibold">
              {coaches.barcelona}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lineup;
