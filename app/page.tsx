"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";

import ActionBar from "@/components/action-bar";
import { Tools, ToolsType } from "@/types";

export default function Home() {
  const initialTool: ToolsType = Tools.selection;

  const [tool, setTool] = useState<ToolsType>(initialTool);
  const [canvasHeight, setCanvasHeight] = useState<number | undefined>(
    undefined
  );
  const [canvasWidth, setCanvasWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  console.log(canvasHeight, canvasWidth);

  useEffect(() => {
    if (canvasHeight && canvasWidth) {
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const rc = rough.canvas(canvas);
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      console.log(ctx);
      if (!rc) return;
      rc.rectangle(100, 100, 100, 100, { roughness: 0.5, fill: "red" });
    }
  }, [canvasHeight, canvasWidth]);

  return (
    <div>
      <ActionBar tool={tool} setTool={setTool} />
      <canvas id="canvas" height={canvasHeight} width={canvasWidth} />
    </div>
  );
}
