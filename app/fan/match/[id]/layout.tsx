import React from "react";
import MatchHeader from "../_components/MatchHeader";
import Container from "@/app/ui/Container";
import MatchStadium from "../_components/MatchStadium";
import MatchFixture from "../_components/MatchFixture";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <div className="flex gap-5">
        <div className="w-[70%]">
          <MatchHeader />
          {children}
        </div>
        <div className="w-[30%]">
          <MatchStadium />
          <MatchFixture />
        </div>
      </div>
    </Container>
  );
};

export default layout;
