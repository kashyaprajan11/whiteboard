"use client";

import { LuPencil } from "react-icons/lu";
import { FiMinus, FiMousePointer, FiSquare } from "react-icons/fi";
import { IoHandRightOutline, IoText } from "react-icons/io5";
import classNames from "classnames";

import { Tools, ToolsType } from "@/types";

type ActionBarProps = {
  tool: ToolsType;
  setTool: (tool: ToolsType) => void;
};

export default function ActionBar({ tool, setTool }: ActionBarProps) {
  return (
    <div className="fixed top-3 z-2 p-[10px] left-1/2 flex gap-3 justify-center transform -translate-x-1/2 bg-[var(--primary-bg-color) border border-[var(--border-color)] rounded-[10px] shadow-[0px_4px_10px_rgba(0,0,0,0.3)]">
      {Object.values(Tools).map((t, index) => (
        <div
          key={t}
          className={classNames(
            "cursor-pointer relative rounded-xl border border-solid border-transparent p-[10px] bg-[var(--primary-bg-color)] transition-colors duration-300 hover:bg-[var(--secondary-bg-color)]",
            tool == t ? "bg-[var(--secondary-bg-color)]" : ""
          )}
        >
          <input
            type="radio"
            id={t}
            checked={tool == t}
            onChange={() => setTool(t)}
            readOnly
            className="cursor-pointer w-[20px] h-[20px] absolute opacity-0"
          />
          <label
            htmlFor={t}
            className="cursor-pointer absolute w-[1px] h-[1px] overflow-hidden whitespace-nowrap border-0"
          >
            {t}
          </label>
          {t == Tools.pan && <IoHandRightOutline size={20} />}
          {t == Tools.selection && <FiMousePointer size={20} />}
          {t == Tools.rectangle && <FiSquare size={20} />}
          {t == Tools.line && <FiMinus size={20} />}
          {t == Tools.pencil && <LuPencil size={20} />}
          {t == Tools.text && <IoText size={20} />}
          <span className="absolute bottom-0 right-[3px] text-xs text-[var(--secondary-text-color)]">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
