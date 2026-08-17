"use client";

import {
  useEffect,
  useState,
} from "react";

type DamageOverlayProps = {
  hitKey: number;
};

export default function DamageOverlay({
  hitKey,
}: DamageOverlayProps) {
  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    if (hitKey <= 0) {
      return;
    }

    /*
     * แดงขึ้นทันที
     */
    setVisible(true);

    /*
     * ค้างแป๊บหนึ่ง
     * แล้วค่อย Fade ออก
     */
    const timer =
      window.setTimeout(() => {
        setVisible(false);
      }, 90);

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    hitKey,
  ]);

  return (
    <div
      className={`
        pointer-events-none
        fixed
        inset-0
        z-[7500]

        ${
          visible
            ? "opacity-100"
            : "opacity-0"
        }
      `}
      style={{
        background: `
          radial-gradient(
            circle at center,
            rgba(255, 0, 0, 0) 30%,
            rgba(150, 0, 0, 0.10) 55%,
            rgba(180, 0, 0, 0.35) 78%,
            rgba(255, 20, 20, 0.72) 100%
          )
        `,

        boxShadow:
          "inset 0 0 130px rgba(255,0,0,0.38)",

        transition: visible
          ? "opacity 35ms ease-out"
          : "opacity 650ms ease-out",
      }}
    />
  );
}