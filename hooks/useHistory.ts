"use client";
import { useState } from "react";
import { ElementType } from "@/types";

export const useHistory = (initialState: ElementType[]) => {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);

  const setState = (
    action: ElementType[] | ((current: ElementType[]) => ElementType[]),
    overwrite = false
  ) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;

    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prev) => prev + 1);
    }
  };

  const undo = () => index > 0 && setIndex((prev) => prev - 1);
  const redo = () => index < history.length - 1 && setIndex((prev) => prev + 1);

  return {
    elements: history[index],
    setElements: setState,
    undo,
    redo,
  };
};
