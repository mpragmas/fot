import React from "react";
import News from "./_components/News";

export default function NewsLayout() {
  return (
    <div className="space-y-5">
      <News />
      <News />
      <News />
    </div>
  );
}
