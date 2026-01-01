import React from "react";
import Image from "next/image";

type TeamFormItem = {
  score: string;
  color: string;
  img: string;
  alt: string;
};

type Props = {
  items?: TeamFormItem[];
};

const DEFAULT_ITEMS: TeamFormItem[] = [
  {
    score: "1-1",
    color: "bg-dark-5",
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    alt: "Inter",
  },
  {
    score: "1-0",
    color: "bg-green-2",
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    alt: "Osasuna",
  },
  {
    score: "4-0",
    color: "bg-red-500",
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    alt: "Arsenal",
  },
  {
    score: "0-2",
    color: "bg-green-2",
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    alt: "Betis",
  },
  {
    score: "3-0",
    color: "bg-green-2",
    img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    alt: "Sevilla",
  },
];

const TeamForm: React.FC<Props> = ({ items }) => {
  const teamForm = items && items.length > 0 ? items : DEFAULT_ITEMS;

  return (
    <div className="w-[50%] rounded-xl bg-[#121212] p-5 shadow-lg">
      <h2 className="mb-7 text-sm font-bold text-gray-300">Team form</h2>
      <div className="flex items-center gap-5">
        {teamForm.map((m, idx) => (
          <div key={idx} className={`flex flex-col items-center gap-3`}>
            <div className={`rounded-md ${m.color} px-4 py-1 text-xs`}>
              {m.score}
            </div>
            <Image
              src={m.img}
              alt={m.alt}
              className="h-6 w-6"
              width={24}
              height={24}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamForm;
