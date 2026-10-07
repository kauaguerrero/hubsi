"use client";

import { useEffect } from "react";

export function ConsoleBoasVindas() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    console.log(
      "%cHUB S.I.%c\nCurioso(a)? A gente também. Quer construir isso com a gente? Fale com o D.A.!",
      "font:700 28px sans-serif;color:#22d3ee",
      "font:14px monospace;color:#9fb3c8",
    );
  }, []);

  return null;
}
