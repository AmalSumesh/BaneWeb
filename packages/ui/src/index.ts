import React, { type ReactNode } from "react";

export interface BoxProps {
  children?: ReactNode;
  className?: string;
}

/** Minimal layout primitive — design system components will be built on top of this. */
export function Box({ children, className }: BoxProps) {
  return React.createElement("div", { className }, children);
}

export * from "./tokens/index";
