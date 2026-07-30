import React from "react";

export const blockInvalidChar = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
};
