import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-light-1 dark:bg-dark">
      <Header />
      {children}
      <Footer />
    </main>
  );
};

export default layout;
