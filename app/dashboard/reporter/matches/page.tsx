import React from "react";
import AllAssignedMatches from "./_components/AllAssignedMatches";
import AssigneeMatchtable from "./_components/AssigneeMatchTable";
const page = () => {
  return (
    <div>
      <AllAssignedMatches />
      <AssigneeMatchtable />
    </div>
  );
};

export default page;
