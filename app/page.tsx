"use client";

import {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
  MouseEvent,
} from "react";
import rough from "roughjs";

import { createElement } from "@/utilities/create-element";
import { drawElement } from "@/utilities/draw-element";
import { useHistory } from "@/hooks/useHistory";
import { adjustmentRequired } from "@/utilities/adjustment-required";
import { adjustedCoordinates } from "@/utilities/adjust-element-coordinates";
import ActionBar from "@/components/action-bar";
import {
  Tools,
  ToolsType,
  ActionTypes,
  ElementType,
  SelectedElementType,
  ExtendedElementType,
} from "@/types";
import { getElementAtPosition } from "@/utilities/get-elements-at-position";
import { cursorForPosition } from "@/utilities/cursor-for-position";
import { resizedCoordinates } from "@/utilities/resized-coordinates";

export default function Home() {
  const initialTool: ToolsType = Tools.selection;

  const [tool, setTool] = useState<ToolsType>(initialTool);
  const [action, setAction] = useState<ActionTypes>("none");
  const { elements, setElements, undo, redo } = useHistory([]);
  const [canvasHeight, setCanvasHeight] = useState<number | undefined>(
    undefined
  );
  const [canvasWidth, setCanvasWidth] = useState<number | undefined>(undefined);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );

  useLayoutEffect(() => {
    setCanvasHeight(window.innerHeight);
    setCanvasWidth(window.innerWidth);
  }, []);

  console.log(elements);
  console.log(selectedElement);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element) => {
      if (
        action === "writing" &&
        selectedElement &&
        selectedElement.id === element.id
      ) {
        return;
      }
      drawElement(roughCanvas, context, element);
    });
    context.restore();
  }, [elements, action, selectedElement]);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (action === "writing" && textArea && selectedElement) {
      setTimeout(() => {
        textArea.focus();
        textArea.value = selectedElement.text || "";
      }, 0);
    }
  }, [action, selectedElement]);

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: ToolsType,
    options?: { text: string }
  ) => {
    const elementCopy = [...elements];
    switch (type) {
      case Tools.line:
      case Tools.rectangle:
        elementCopy[id] = createElement(id, x1, y1, x2, y2, type);
        break;

      case Tools.pencil:
        const existingPoints = elementCopy[id].points || [];
        elementCopy[id].points = [...existingPoints, { x: x2, y: y2 }];
        break;

      case Tools.text:
        const canvas = document.getElementById("canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
          throw new Error("Canvas element not found");
        }
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get 2D context from canvas");
        }
        if (!options) {
          throw new Error("No text options provided for text tool");
        }
        const textWidth = context.measureText(options.text).width;
        const textHeight = 24;
        elementCopy[id] = {
          ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type),
          text: options.text,
        };
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    setElements(elementCopy, true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (selectedElement) {
      const { id, x1, y1, type } = selectedElement;

      const x2 = selectedElement.x2 || x1;
      const y2 = selectedElement.y2 || y1;

      setAction("none");
      setSelectedElement(null);
      updateElement(id, x1, y1, x2, y2, type, { text: event.target.value });
    } else {
      console.error("No element selected when handleBlur was called");
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (action === "writing") return;

    if (tool == Tools.selection) {
      const element = getElementAtPosition(clientX, clientY, elements);

      if (element) {
        let selectedElement: SelectedElementType = { ...element };
        if (element.type === "pencil" && element.points) {
          const xOffsets = element.points.map((point) => clientX - point.x);
          const yOffsets = element.points.map((point) => clientY - point.y);
          selectedElement = { ...selectedElement, xOffsets, yOffsets };
        } else {
          const offsetX = clientX - selectedElement.x1;
          const offsetY = clientY - selectedElement.y1;
          selectedElement = { ...selectedElement, offsetX, offsetY };
        }

        setSelectedElement(selectedElement);
        // setElements((prevState) => prevState);

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    }

    if (
      tool == Tools.rectangle ||
      tool == Tools.line ||
      tool == Tools.pencil ||
      tool == Tools.text
    ) {
      const id = elements.length;
      const newElement = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prev) => [...prev, newElement]);
      setSelectedElement(newElement);
      setAction(tool == Tools.text ? "writing" : "drawing");
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (tool === Tools.selection) {
      const element = getElementAtPosition(clientX, clientY, elements);

      if (element && element.position) {
        (event.target as HTMLElement).style.cursor = cursorForPosition(
          element.position
        );
      } else {
        (event.target as HTMLElement).style.cursor = "default";
      }
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving" && selectedElement) {
      if (
        selectedElement.type === "pencil" &&
        "points" in selectedElement &&
        "xOffsets" in selectedElement &&
        "yOffsets" in selectedElement
      ) {
        const extendedElement = selectedElement as ExtendedElementType;
        const newPoints = extendedElement.points!.map((_, index) => ({
          x: clientX - extendedElement.xOffsets![index],
          y: clientY - extendedElement.yOffsets![index],
        }));
        const elementsCopy = [...elements];
        elementsCopy[extendedElement.id] = {
          ...elementsCopy[extendedElement.id],
          points: newPoints,
        };
        setElements(elementsCopy, true);
      } else {
        const { id, x1, x2, y1, y2, type, offsetX, offsetY } =
          selectedElement as SelectedElementType;
        const safeOffsetX = offsetX ?? 0;
        const safeOffsetY = offsetY ?? 0;
        const newX1 = clientX - safeOffsetX;
        const newY1 = clientY - safeOffsetY;
        // 🫐 Calculate the new position for x2 and y2 based on the original size
        const newX2 = newX1 + (x2 - x1);
        const newY2 = newY1 + (y2 - y1);
        const options =
          type === "text" && selectedElement.text
            ? { text: selectedElement.text }
            : undefined;
        updateElement(id, newX1, newY1, newX2, newY2, type, options);
      }
    } else if (
      action === "resizing" &&
      selectedElement &&
      selectedElement.position
    ) {
      const { id, type, position, ...coordinates } =
        selectedElement as ExtendedElementType;

      if (typeof position === "string") {
        const { x1, y1, x2, y2 } = resizedCoordinates(
          clientX,
          clientY,
          position,
          coordinates
        );

        updateElement(id, x1, y1, x2, y2, type);
      }
    }
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    const { clientX, clientY } = event;

    if (selectedElement) {
      const index = elements.length - 1;
      const { id, type } = elements[index];

      if (action === "drawing" && adjustmentRequired(type)) {
        const { x1, y1, x2, y2 } = adjustedCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }

    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div>
      <ActionBar tool={tool} setTool={setTool} />
      {action === "writing" && (
        <textarea
          ref={textAreaRef}
          className="textArea"
          onBlur={handleBlur}
          style={{
            font: "24px sans-serif",
            top: selectedElement ? selectedElement.y1 : 0,
            left: selectedElement ? selectedElement.x1 : 0,
          }}
        />
      )}
      <canvas
        id="canvas"
        height={canvasHeight}
        width={canvasWidth}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
