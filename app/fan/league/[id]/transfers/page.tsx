import React from "react";
import Image from "next/image";

interface Player {
  name: string;
  clubLogo: string;
  club: string;
  fee: string;
  fromLogo: string;
  from: string;
  position: string;
  contract: string;
  marketValue: string;
  date: string;
  photo: string;
}

const players: Player[] = [
  {
    name: "Joshua Dasilva",
    clubLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    club: "Brentford",
    fee: "Free Transfer",
    fromLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    from: "Free Agent",
    position: "",
    contract: "Oct 2025 – Jun 2026",
    marketValue: "€2.1M",
    date: "Oct 27, 2025",
    photo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
  },
  {
    name: "Donnell McNeilly",
    clubLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    club: "Wycombe",
    fee: "On Loan",
    fromLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    from: "Nottm Forest",
    position: "ST",
    contract: "Sep 2025 – Jun 2026",
    marketValue: "€170K",
    date: "Oct 3, 2025",
    photo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
  },
  {
    name: "Charlie Casper",
    clubLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    club: "Grimsby",
    fee: "On Loan",
    fromLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    from: "Burnley",
    position: "GK",
    contract: "Sep 2025 – May 2026",
    marketValue: "€20K",
    date: "Oct 3, 2025",
    photo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
  },
  {
    name: "Modou Keba Cisse",
    clubLogo:
      "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg",
    club: "Aston Villa",
    fee: "€5.5M",
    fromLogo: "https://upload.wikimedia.org/wikipedia/en/9/96/LASK_Logo.svg",
    from: "LASK",
    position: "CB",
    contract: "Jan 2026 – Undisclosed",
    marketValue: "€1.3M",
    date: "Sep 28, 2025",
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
  },
];

const TransfersTable: React.FC = () => {
  return (
    <div className="dark:bg-dark-1 mt-10 rounded-xl p-4 font-sans text-gray-200 shadow-lg">
      <table className="w-full border-separate border-spacing-y-3">
        <thead>
          <tr className="text-sm text-gray-400">
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              <span>Player</span>
            </th>
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              Fee
            </th>
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              From
            </th>
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              Position
            </th>
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              Contract
            </th>
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              Market value
            </th>
            <th className="dark:border-dark-2 border-b px-3 py-2 text-left font-medium">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr
              key={i}
              className="dark:hover:bg-dark-2 dark:border-dark-2 rounded-xl border-b text-sm transition"
            >
              <td className="dark:border-dark-2 flex items-center gap-3 rounded-l-xl border-b p-3 align-middle">
                <Image
                  src={p.photo}
                  alt={p.name}
                  className="h-10 w-10 rounded-full object-cover"
                  width={20}
                  height={20}
                />
                <div>
                  <div className="dark:text-whitish font-semibold">
                    {p.name}
                  </div>
                  <div className="dark:text-dark-5 flex items-center gap-2 text-xs">
                    <Image
                      src={p.clubLogo}
                      alt={p.club}
                      className="h-4 w-4 object-contain"
                    />
                    {p.club}
                  </div>
                </div>
              </td>

              <td className="dark:border-dark-2 border-b p-3 align-middle text-gray-200">
                {p.fee}
              </td>

              <td className="dark:border-dark-2 border-b p-3 align-middle">
                <div className="flex items-center gap-2">
                  <Image
                    src={p.fromLogo}
                    alt={p.from}
                    className="h-4 w-4 object-contain"
                    width={20}
                    height={20}
                  />
                  <span>{p.from}</span>
                </div>
              </td>

              <td className="dark:border-dark-2 border-b p-3 align-middle">
                {p.position && (
                  <span className="dark:bg-dark-2 rounded-md px-2 py-0.5 text-xs font-semibold text-gray-300">
                    {p.position}
                  </span>
                )}
              </td>

              <td className="dark:border-dark-2 border-b p-3 align-middle">
                {p.contract}
              </td>
              <td className="dark:border-dark-2 border-b p-3 align-middle">
                {p.marketValue}
              </td>
              <td className="dark:border-dark-2 rounded-r-xl border-b p-3 align-middle text-gray-400">
                {p.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransfersTable;
