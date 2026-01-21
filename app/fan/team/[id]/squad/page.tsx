import React from "react";
import prisma from "@/app/lib/prisma";

interface SquadRow {
  img: string;
  name: string;
  position: string;
  country: { flag: string; name: string };
  shirt?: number | string;
  age: number | string;
  height: string;
  marketValue: string;
}

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

const TableRow: React.FC<{ player: SquadRow }> = ({ player }) => (
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
    <td className="px-4 py-3 align-middle text-gray-300">{player.position}</td>
    <td className="px-4 py-3 align-middle text-gray-300">
      <div className="flex items-center gap-2">
        <span className="text-lg">{player.country.flag}</span>
        <span>{player.country.name}</span>
      </div>
    </td>
    <td className="px-4 py-3 align-middle text-gray-300">
      {player.shirt ?? "-"}
    </td>
    <td className="px-4 py-3 align-middle text-gray-300">{player.age}</td>
    <td className="px-4 py-3 align-middle text-gray-300">{player.height}</td>
    <td className="px-4 py-3 align-middle text-gray-300">
      {player.marketValue}
    </td>
  </tr>
);

type SquadPageProps = {
  params: Promise<{ id: string }>;
};

const TeamTable = async ({ params }: SquadPageProps) => {
  const { id } = await params;
  const teamId = Number(id);

  const players = Number.isFinite(teamId)
    ? await prisma.player.findMany({
        where: { teamId },
        orderBy: [{ position: "asc" }, { number: "asc" }],
      })
    : [];

  const rows: SquadRow[] = players.map((p) => ({
    img: p.image ?? "/images/default player image.png",
    name:
      [p.firstName, p.lastName].filter(Boolean).join(" ") || `Player ${p.id}`,
    position: p.position,
    country: { flag: "", name: "" },
    shirt: p.number ?? "-",
    age: p.age ?? "-",
    height: "-",
    marketValue: "-",
  }));

  return (
    <div className="dark:bg-dark-1 mt-10 overflow-hidden rounded-2xl text-white shadow-lg">
      <table className="w-full text-sm">
        <TableHeader />
        <tbody>
          {rows.map((player) => (
            <TableRow key={player.name} player={player} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;
