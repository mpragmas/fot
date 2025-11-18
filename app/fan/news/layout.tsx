import React from "react";
import Container from "@/app/ui/Container";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <Container>{children}</Container>;
};

export default layout;
