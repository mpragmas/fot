import Table from "../_components/Table";
import Matches from "../_components/Matches";
import TeamFormation from "../_components/TeamFormation";

const players = [
  { name: "Djihad Bizimana", rating: "8.5", image: "" },
  { name: "Ange Mutsinzi", rating: "8.3", image: "" },
  { name: "Fiacre Ntwari", rating: "8.2", image: "" },
  { name: "Bonheur Mugisha", rating: "8.1", image: "" },
  { name: "Emmanuel Imanishimwe", rating: "8.0", image: "" },
  { name: "Thierry Manzi", rating: "7.9", image: "" },
  { name: "Jojea Kwizera", rating: "7.9", image: "" },
  { name: "Hakim Sahabo", rating: "7.8", image: "" },
  { name: "Innocent Nshuti", rating: "7.7", image: "" },
  { name: "Fitina Omborenga", rating: "7.6", image: "" },
  { name: "Kevin Muhire", rating: "7.6", image: "" },
];

export default function Overview({ params }: { params: { id: string } }) {
  return (
    <div className="mt-7 w-full">
      <Matches />
      <div className="mt-5 flex gap-5">
        <div className="w-[70%]">
          <Table />
        </div>
        <div className="bg-dark-0 w-[30%]">
          <TeamFormation formation={[4, 2, 3, 1]} players={players} />
        </div>
      </div>
    </div>
  );
}
