import React from "react";

interface Player {
  img: string;
  name: string;
  position: string;
  country: { flag: string; name: string };
  shirt?: number | string;
  age: number;
  height: string;
  marketValue: string;
}

const players: Player[] = [
  {
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    name: "Enzo Maresca",
    position: "Coach",
    country: { flag: "🇮🇹", name: "Italy" },
    age: 45,
    height: "180 cm",
    marketValue: "-",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    name: "Robert Sánchez",
    position: "GK",
    country: { flag: "🇪🇸", name: "Spain" },
    shirt: 1,
    age: 27,
    height: "197 cm",
    marketValue: "€24.7M",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    name: "Filip Jörgensen",
    position: "GK",
    country: { flag: "🇩🇰", name: "Denmark" },
    shirt: 12,
    age: 23,
    height: "190 cm",
    marketValue: "€22.6M",
  },
];

const TableHeader = () => (
  <thead className="dark:text-dark-3 text-xs font-bold">
    <tr>
      {[
        "Player",
        "Position",
        "Country",
        "Shirt",
        "Age",
        "Height",
        "Market value",
      ].map((heading) => (
        <th key={heading} className="px-4 py-3 text-left">
          {heading}
        </th>
      ))}
    </tr>
  </thead>
);

const TableRow: React.FC<{ player: Player }> = ({ player }) => (
  <tr className="dark:border-dark-2 border-b font-bold">
    <td className="px-4 py-3 align-middle">
      <div className="flex items-center gap-3">
        <img
          src={player.img}
          alt={player.name}
          className="h-7 w-7 rounded-full object-contain"
        />
        <span className="font-medium text-white">{player.name}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-gray-300 align-middle">{player.position}</td>
    <td className="px-4 py-3 text-gray-300 align-middle">
      <div className="flex items-center gap-2">
        <span className="text-lg">{player.country.flag}</span>
        <span>{player.country.name}</span>
      </div>
    </td>
    <td className="px-4 py-3 text-gray-300 align-middle">{player.shirt ?? "-"}</td>
    <td className="px-4 py-3 text-gray-300 align-middle">{player.age}</td>
    <td className="px-4 py-3 text-gray-300 align-middle">{player.height}</td>
    <td className="px-4 py-3 text-gray-300 align-middle">{player.marketValue}</td>
  </tr>
);

const TeamTable: React.FC = () => (
  <div className="dark:bg-dark-1 mt-10 overflow-hidden rounded-2xl text-white shadow-lg">
    <table className="w-full text-sm">
      <TableHeader />
      <tbody>
        {players.map((player) => (
          <TableRow key={player.name} player={player} />
        ))}
      </tbody>
    </table>
  </div>
);

export default TeamTable;
