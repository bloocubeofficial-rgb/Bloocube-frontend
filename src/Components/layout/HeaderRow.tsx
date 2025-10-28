"use client";

import React from "react";
import clsx from "clsx";

interface HeaderRowProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

const HeaderRow: React.FC<HeaderRowProps> = ({ left, right, className }) => {
  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <div className="flex items-center">
        {left}
      </div>
      <div className="flex items-center">
        {right}
      </div>
    </div>
  );
};

export default HeaderRow;


