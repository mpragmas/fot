import React from "react";

export default function TransfersTable() {
  const transfers = [
    {
      player: "Kagege",
      from: "APR Fc",
      to: "Gasogi United",
      date: "2024-08-01",
      fee: "$20,000",
      status: "Approved",
    },
    {
      player: "Mamel Dao",
      from: "APR Fc",
      to: "Gasogi United",
      date: "2024-08-01",
      fee: "$20,000",
      status: "Pending",
    },
    {
      player: "Ssekiganda",
      from: "APR Fc",
      to: "Gasogi United",
      date: "2024-08-01",
      fee: "$20,000",
      status: "Pending",
    },
    {
      player: "Niyomugabo",
      from: "APR Fc",
      to: "Gasogi United",
      date: "2024-08-01",
      fee: "$20,000",
      status: "Approved",
    },
  ];

  return (
    <div className="border-gray-2 m-6 my-6 flex justify-center rounded-xl border-2 p-6">
      <div className="w-full p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Transfers</h1>
          <button className="text-whitish rounded-lg bg-blue-600 px-4 py-2 transition hover:bg-blue-700">
            New Transfers
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300 text-sm text-gray-600">
              <th className="px-2 py-4">Player</th>
              <th className="px-2 py-4">To Team</th>
              <th className="px-2 py-4">From Team</th>
              <th className="px-2 py-4">Fee</th>
              <th className="px-2 py-4">Date</th>
              <th className="px-2 py-4">Action</th>
              <th className="px-2 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {transfers.map((t, index) => (
              <React.Fragment key={index}>
                <tr className="border-b border-gray-300 text-sm">
                  <td className="px-2 py-4 font-medium">{t.player}</td>
                  <td className="px-2 py-4">{t.from}</td>
                  <td className="px-2 py-4">{t.to}</td>
                  <td className="px-2 py-4">{t.date}</td>
                  <td className="px-2 py-4">{t.fee}</td>
                  <td className="px-2 py-4 font-semibold">
                    <span
                      className={
                        t.status === "Approved"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="flex gap-3 px-2 py-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      🗑️
                    </button>
                  </td>
                </tr>

                {/* SPACER ROW */}
                {index !== transfers.length - 1 && (
                  <tr>
                    <td colSpan={7} className="h-3"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
