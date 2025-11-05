import React from "react";
import MatchHeader from "../_components/MatchHeader";
import Container from "@/app/ui/Container";
import MatchCard from "../_components/MatchHeader";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <div className="w-[70%]">
        <MatchCard />
      </div>
      <div className="w-[30%]"></div>

      {children}
    </Container>
  );
};

export default layout;
