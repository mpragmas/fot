import Player from "@/app/ui/Player";

export default function TeamFormation({
  formation = [4, 2, 3, 1],
  players = [],
}: {
  formation: number[];
  players: { name: string; rating: string; image: string }[];
}) {
  // Flatten formation to know how many players we need
  const totalPlayers = formation.reduce((a, b) => a + b, 0) + 1; // +1 for goalkeeper

  if (players.length < totalPlayers) {
    return <p>Not enough players for this formation</p>;
  }

  // Goalkeeper
  const goalkeeper = players[0];

  // Outfield players split by formation rows
  const outfield = players.slice(1);
  const rows = [];
  let index = 0;
  for (const count of formation) {
    rows.push(outfield.slice(index, index + count));
    index += count;
  }

  return (
    <div className="dark:bg-dark-1 dark:text-whitish rounded-2xl p-4">
      <h2 className="mb-2 text-center text-lg font-semibold">
        Team of the Week
      </h2>
      <p className="mb-4 text-center text-sm">Custom Formation</p>

      <div className="relative flex h-[520px] w-full flex-col justify-between rounded-xl py-4">
        {/* Render rows */}
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center gap-2"
            style={{ flex: 1 }}
          >
            {row.map((player, i) => (
              <Player key={i} {...player} />
            ))}
          </div>
        ))}

        {/* Goalkeeper */}
        <div className="flex justify-center">
          <Player {...goalkeeper} />
        </div>
      </div>
    </div>
  );
}
