"use client";

import { useEffect, useRef } from "react";

type PlayerPositionDebugProps = {
  positionRef: {
    current: {
      x: number;
      y: number;
      z: number;
    } | null;
  };
};

function formatAxis(value: number) {
  return value.toFixed(2);
}

export default function PlayerPositionDebug({
  positionRef,
}: PlayerPositionDebugProps) {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId = 0;

    let lastDisplayTime = performance.now();

    function update(currentTime: number) {
      const elapsed = currentTime - lastDisplayTime;

      if (elapsed >= 100) {
        const position = positionRef.current;

        if (textRef.current) {
          textRef.current.textContent = position
            ? `Player X ${formatAxis(position.x)} | Y ${formatAxis(
                position.y,
              )} | Z ${formatAxis(position.z)}`
            : "Player X -- | Y -- | Z --";
        }

        lastDisplayTime = currentTime;
      }

      frameId = requestAnimationFrame(update);
    }

    frameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [positionRef]);

  return (
    <div
      ref={textRef}
      className="
        pointer-events-none
        fixed
        left-3
        top-16
        z-99999
        rounded
        bg-black/80
        px-3
        py-2
        font-mono
        text-sm
        text-cyan-200
      "
    >
      Player X -- | Y -- | Z --
    </div>
  );
}
