import React from "react";

const MatchFixture = () => {
  return (
    <div className="dark:border-dark-2 mx-auto flex justify-between border-b-1 p-4">
      <p></p>
      <div className="flex gap-3">
        <div className="flex items-center space-x-2">
          <p className="text-sm">APR FC</p>
          <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
        </div>
        <p className="self-center">0 - 0</p>
        <div className="flex items-center space-x-2">
          <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
          <p className="text-sm">APR FC</p>
        </div>
      </div>
      <p></p>
    </div>
  );
};

export default MatchFixture;
