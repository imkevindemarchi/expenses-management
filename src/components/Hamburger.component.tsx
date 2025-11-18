import React, { FC } from "react";

interface IProps {
  onClick: () => void;
  isActive: boolean;
}

const Hamburger: FC<IProps> = ({ onClick, isActive }) => {
  const lines: number[] = [1, 2, 3];

  return (
    <button
      onClick={onClick}
      style={{ zIndex: 999 }}
      className={`mobile:flex flex-col top-7 left-7 justify-around w-10 h-10 fixed hidden`}
    >
      {lines.map((line: number) => (
        <div
          key={line}
          style={{ transformOrigin: "1px" }}
          className={`w-10 h-1 relative rounded-sm first:rotate-0 even:opacity-1 even:translate-x-0 last:rotate-0 transition-all duration-300 bg-white
            ${
              isActive &&
              "bg-white opacity-100 first:rotate-45 even:opacity-0 even:translate-x-20 last:rotate-[-45deg]"
            } ${isActive ? "opacity-100" : "opacity-50"}`}
        />
      ))}
    </button>
  );
};

export default Hamburger;
