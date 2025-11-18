import * as React from "react";

export type BasicTemplateProps = {
  title: string;
  message: string;
};

export function BasicTemplate({ title, message }: BasicTemplateProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  );
}
