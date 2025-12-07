import React from "react";

const NewsArticles = () => {
  const articles = [
    {
      id: 1,
      title: "Untitled article",
      status: "Published",
      lastUpdated: "10/12/2025, 6:00 PM",
    },
    {
      id: 2,
      title: "Untitled article",
      status: "Draft",
      lastUpdated: "10/12/2025, 6:00 PM",
    },
  ];

  return (
    <div className="flex justify-center p-6">
      <div className="w-full p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">News Articles</h1>
            <p className="text-sm text-gray-500">
              Create, edit and publish articles for your coverage.
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search articles..."
              className="focus:border-blue-3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
            <button className="bg-blue-2 hover:bg-blue-2/80 cursor-pointer rounded-lg px-4 py-2 text-white transition">
              New Article
            </button>
          </div>
        </div>

        <div className="border-gray-2 rounded-xl border-2 p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300 text-sm text-gray-600">
                <th className="px-2 py-4">Title</th>
                <th className="px-2 py-4">Status</th>
                <th className="px-2 py-4">Last Updated</th>
                <th className="px-2 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {articles.map((article, index) => (
                <React.Fragment key={article.id}>
                  <tr className="border-b border-gray-300 text-sm">
                    <td className="px-2 py-4 font-semibold">{article.title}</td>
                    <td className="px-2 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          article.status === "Published"
                            ? "bg-blue-3 text-blue-2"
                            : "bg-gray-2 text-dark"
                        }`}
                      >
                        {article.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 font-extralight">
                      {article.lastUpdated}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Unpublish"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* SPACER ROW */}
                  {index !== articles.length - 1 && (
                    <tr>
                      <td colSpan={4} className="h-3"></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewsArticles;
