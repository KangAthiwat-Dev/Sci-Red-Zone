"use client";

import {
  useEffect,
  useRef,
} from "react";

export type WirePoint = {
  x: number;
  y: number;
};

type PhysicsPoint = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
};

type PhysicsWireProps = {
  start: WirePoint;
  end: WirePoint;
  color: string;
};

const POINT_COUNT = 18;

const GRAVITY = 0.55;
const DAMPING = 0.985;
const CONSTRAINT_ITERATIONS = 7;

export default function PhysicsWire({
  start,
  end,
  color,
}: PhysicsWireProps) {
  const shadowRef =
    useRef<SVGPolylineElement | null>(
      null,
    );

  const wireRef =
    useRef<SVGPolylineElement | null>(
      null,
    );

  const pointsRef =
    useRef<PhysicsPoint[]>([]);

  const startRef =
    useRef(start);

  const endRef =
    useRef(end);

  useEffect(() => {
    startRef.current = start;
  }, [start.x, start.y]);

  useEffect(() => {
    endRef.current = end;
  }, [end.x, end.y]);

  useEffect(() => {
    /*
     * สร้างจุดย่อยตามแนวสาย
     */
    const points: PhysicsPoint[] = [];

    for (
      let i = 0;
      i < POINT_COUNT;
      i += 1
    ) {
      const t =
        i / (POINT_COUNT - 1);

      const x =
        start.x +
        (end.x - start.x) * t;

      /*
       * เริ่มต้นให้สายหย่อนนิดหนึ่ง
       */
      const sag =
        Math.sin(Math.PI * t) *
        30;

      const y =
        start.y +
        (end.y - start.y) * t +
        sag;

      points.push({
        x,
        y,
        oldX: x,
        oldY: y,
      });
    }

    pointsRef.current = points;

    let frameId = 0;
    let previousTime =
      performance.now();

    function update(
      currentTime: number,
    ) {
      const points =
        pointsRef.current;

      if (points.length === 0) {
        return;
      }

      /*
       * จำกัด delta กัน tab กระตุก
       */
      const delta =
        Math.min(
          (currentTime -
            previousTime) /
            16.6667,
          2,
        );

      previousTime =
        currentTime;

      const currentStart =
        startRef.current;

      const currentEnd =
        endRef.current;

      // =========================
      // PIN START / END
      // =========================

      points[0].x =
        currentStart.x;

      points[0].y =
        currentStart.y;

      const lastIndex =
        points.length - 1;

      points[lastIndex].x =
        currentEnd.x;

      points[lastIndex].y =
        currentEnd.y;

      // =========================
      // VERLET PHYSICS
      // =========================

      for (
        let i = 1;
        i < lastIndex;
        i += 1
      ) {
        const point =
          points[i];

        const velocityX =
          (point.x -
            point.oldX) *
          DAMPING;

        const velocityY =
          (point.y -
            point.oldY) *
          DAMPING;

        point.oldX =
          point.x;

        point.oldY =
          point.y;

        point.x +=
          velocityX * delta;

        point.y +=
          velocityY * delta +
          GRAVITY *
            delta *
            delta;
      }

      /*
       * ความยาวสายจริงจะยาวกว่า
       * ระยะตรงเล็กน้อย
       * จึงมีพื้นที่ให้สายหย่อน
       */
      const dx =
        currentEnd.x -
        currentStart.x;

      const dy =
        currentEnd.y -
        currentStart.y;

      const directDistance =
        Math.sqrt(
          dx * dx + dy * dy,
        );

      const totalLength =
        directDistance * 1.12 +
        30;

      const segmentLength =
        totalLength /
        (POINT_COUNT - 1);

      // =========================
      // ROPE CONSTRAINT
      // =========================

      for (
        let iteration = 0;
        iteration <
        CONSTRAINT_ITERATIONS;
        iteration += 1
      ) {
        /*
         * ตรึงหัวสาย
         */
        points[0].x =
          currentStart.x;

        points[0].y =
          currentStart.y;

        /*
         * ตรึงปลายสาย
         */
        points[lastIndex].x =
          currentEnd.x;

        points[lastIndex].y =
          currentEnd.y;

        for (
          let i = 0;
          i < lastIndex;
          i += 1
        ) {
          const pointA =
            points[i];

          const pointB =
            points[i + 1];

          const segmentX =
            pointB.x -
            pointA.x;

          const segmentY =
            pointB.y -
            pointA.y;

          const distance =
            Math.sqrt(
              segmentX *
                segmentX +
                segmentY *
                  segmentY,
            ) || 0.0001;

          const difference =
            (distance -
              segmentLength) /
            distance;

          const correctionX =
            segmentX *
            difference;

          const correctionY =
            segmentY *
            difference;

          const aPinned =
            i === 0;

          const bPinned =
            i + 1 ===
            lastIndex;

          if (
            !aPinned &&
            !bPinned
          ) {
            pointA.x +=
              correctionX *
              0.5;

            pointA.y +=
              correctionY *
              0.5;

            pointB.x -=
              correctionX *
              0.5;

            pointB.y -=
              correctionY *
              0.5;
          } else if (
            aPinned &&
            !bPinned
          ) {
            pointB.x -=
              correctionX;

            pointB.y -=
              correctionY;
          } else if (
            !aPinned &&
            bPinned
          ) {
            pointA.x +=
              correctionX;

            pointA.y +=
              correctionY;
          }
        }
      }

      /*
       * pin ซ้ำหลัง constraint
       */
      points[0].x =
        currentStart.x;

      points[0].y =
        currentStart.y;

      points[lastIndex].x =
        currentEnd.x;

      points[lastIndex].y =
        currentEnd.y;

      const pointsAttribute =
        points
          .map(
            (point) =>
              `${point.x},${point.y}`,
          )
          .join(" ");

      shadowRef.current?.setAttribute(
        "points",
        pointsAttribute,
      );

      wireRef.current?.setAttribute(
        "points",
        pointsAttribute,
      );

      frameId =
        requestAnimationFrame(
          update,
        );
    }

    frameId =
      requestAnimationFrame(
        update,
      );

    return () => {
      cancelAnimationFrame(
        frameId,
      );
    };
  }, []);

  return (
    <>
      {/* Shadow */}
      <polyline
        ref={shadowRef}
        fill="none"
        stroke="rgba(0,0,0,0.65)"
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Actual Wire */}
      <polyline
        ref={wireRef}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}