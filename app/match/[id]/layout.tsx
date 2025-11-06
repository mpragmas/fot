import React from "react";
import MatchHeader from "../_components/MatchHeader";
import Container from "@/app/ui/Container";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <div className="w-[70%]">
        <MatchHeader />
        {children}
      </div>
      <div className="w-[30%]"></div>
    </Container>
  );
};

export default layout;
