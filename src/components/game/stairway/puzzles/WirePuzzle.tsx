"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WirePoint = {
  x: number;
  y: number;
};

type WireColor = "red" | "blue" | "yellow";

type WirePuzzleProps = {
  onComplete: () => void;
  onClose: () => void;
};

type WireDefinition = {
  id: WireColor;
  label: string;
  className: string;
  color: string;
};

const WIRES: WireDefinition[] = [
  {
    id: "red",
    label: "RED",
    className: "bg-red-500",
    color: "#ff334d",
  },

  {
    id: "blue",
    label: "BLUE",
    className: "bg-blue-500",
    color: "#2f7df4",
  },

  {
    id: "yellow",
    label: "YELLOW",
    className: "bg-yellow-400",
    color: "#ffc400",
  },
];

/*
 * Socket จงใจสลับลำดับ
 */
const SOCKETS: WireColor[] = ["blue", "yellow", "red"];

type AnchorMap = Record<WireColor, WirePoint | null>;

const EMPTY_ANCHORS: AnchorMap = {
  red: null,
  blue: null,
  yellow: null,
};

export default function WirePuzzle({ onComplete, onClose }: WirePuzzleProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const wireAnchorRefs = useRef<
    Partial<Record<WireColor, HTMLDivElement | null>>
  >({});

  const socketAnchorRefs = useRef<
    Partial<Record<WireColor, HTMLDivElement | null>>
  >({});

  const socketDropRefs = useRef<
    Partial<Record<WireColor, HTMLDivElement | null>>
  >({});

  const [connected, setConnected] = useState<Set<WireColor>>(
    () => new Set<WireColor>(),
  );

  const [draggingWire, setDraggingWire] = useState<WireColor | null>(null);

  const [cursorPoint, setCursorPoint] = useState<WirePoint | null>(null);

  const [wireAnchors, setWireAnchors] = useState<AnchorMap>(EMPTY_ANCHORS);

  const [socketAnchors, setSocketAnchors] = useState<AnchorMap>(EMPTY_ANCHORS);

  const [message, setMessage] = useState("ลากสายไฟไปเสียบเข้าช่องสีเดียวกัน");

  // ==============================
  // Coordinate Helpers
  // ==============================

  const getLocalPoint = useCallback(
    (clientX: number, clientY: number): WirePoint => {
      const panel = panelRef.current;

      if (!panel) {
        return {
          x: 0,
          y: 0,
        };
      }

      const rect = panel.getBoundingClientRect();

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [],
  );

  const getElementCenter = useCallback(
    (element: HTMLElement | null | undefined): WirePoint | null => {
      const panel = panelRef.current;

      if (!panel || !element) {
        return null;
      }

      const panelRect = panel.getBoundingClientRect();

      const elementRect = element.getBoundingClientRect();

      return {
        x: elementRect.left - panelRect.left + elementRect.width / 2,

        y: elementRect.top - panelRect.top + elementRect.height / 2,
      };
    },
    [],
  );

  // ==============================
  // Update Anchor Positions
  // ==============================

  const refreshAnchors = useCallback(() => {
    setWireAnchors({
      red: getElementCenter(wireAnchorRefs.current.red),

      blue: getElementCenter(wireAnchorRefs.current.blue),

      yellow: getElementCenter(wireAnchorRefs.current.yellow),
    });

    setSocketAnchors({
      red: getElementCenter(socketAnchorRefs.current.red),

      blue: getElementCenter(socketAnchorRefs.current.blue),

      yellow: getElementCenter(socketAnchorRefs.current.yellow),
    });
  }, [getElementCenter]);

  useEffect(() => {
    /*
     * รอ DOM วาง layout ก่อน
     */
    const frame = requestAnimationFrame(refreshAnchors);

    window.addEventListener("resize", refreshAnchors);

    const observer = new ResizeObserver(refreshAnchors);

    if (panelRef.current) {
      observer.observe(panelRef.current);
    }

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("resize", refreshAnchors);

      observer.disconnect();
    };
  }, [refreshAnchors]);

  // ==============================
  // Start Drag
  // ==============================

  function beginDrag(
    wire: WireColor,
    event: React.PointerEvent<HTMLDivElement>,
  ) {
    if (connected.has(wire)) {
      return;
    }

    event.preventDefault();

    setDraggingWire(wire);

    setCursorPoint(getLocalPoint(event.clientX, event.clientY));

    const definition = WIRES.find((item) => item.id === wire);

    setMessage(`กำลังลากสาย ${definition?.label ?? wire}`);
  }

  // ==============================
  // Drop Detection
  // ==============================

  const findSocketAtPoint = useCallback(
    (clientX: number, clientY: number): WireColor | null => {
      for (const socket of SOCKETS) {
        const element = socketDropRefs.current[socket];

        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();

        const inside =
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom;

        if (inside) {
          return socket;
        }
      }

      return null;
    },
    [],
  );

  // ==============================
  // Global Pointer Drag
  // ==============================

  useEffect(() => {
    if (!draggingWire) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      setCursorPoint(getLocalPoint(event.clientX, event.clientY));
    }

    function handlePointerUp(event: PointerEvent) {
      const wire = draggingWire;

      const socket = findSocketAtPoint(event.clientX, event.clientY);

      setDraggingWire(null);
      setCursorPoint(null);

      /*
       * ปล่อยนอก Socket
       */
      if (!socket) {
        setMessage("ปล่อยสายลงบนช่อง SOCKET");

        return;
      }

      /*
       * สีผิด
       */
      if (socket !== wire) {
        setMessage("สีสายไม่ตรงกับช่อง — ลองใหม่");

        return;
      }

      /*
       * ต่อถูก
       */
      const next = new Set(connected);

      next.add(wire);

      setConnected(next);

      setMessage(`เชื่อมต่อสาย ${wire.toUpperCase()} สำเร็จ`);

      requestAnimationFrame(refreshAnchors);

      /*
       * ครบทั้ง 3 เส้น
       */
      if (next.size === WIRES.length) {
        setMessage("ระบบไฟฟ้ากลับมาทำงานแล้ว");

        window.setTimeout(() => {
          onComplete();
        }, 700);
      }
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });

    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    draggingWire,
    connected,
    findSocketAtPoint,
    getLocalPoint,
    onComplete,
    refreshAnchors,
  ]);

  return (
    <div
      className="
        fixed
        inset-0
        z-[9000]
        flex
        items-center
        justify-center
        bg-black/80
      "
    >
      <div
        ref={panelRef}
        className="
          relative
          w-[760px]
          max-w-[92vw]
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-[#101419]
          p-8
          text-white
          shadow-2xl
          select-none
        "
        style={{
          touchAction: "none",
        }}
      >
        {/* ==========================
            Physics Wire Layer
        ========================== */}

        <svg
          className="
            pointer-events-none
            absolute
            inset-0
            z-10
            h-full
            w-full
          "
        >
          {/* สายที่ต่อสำเร็จแล้ว */}

          {WIRES.map((wire) => {
            const start = wireAnchors[wire.id];

            const end = socketAnchors[wire.id];

            if (!connected.has(wire.id) || !start || !end) {
              return null;
            }

            return (
              <g key={`connected-${wire.id}`}>
                {/* Shadow */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="rgba(0,0,0,0.55)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Wire */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={wire.color}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* สายที่กำลังลาก */}

          {draggingWire &&
            cursorPoint &&
            wireAnchors[draggingWire] &&
            (() => {
              const start = wireAnchors[draggingWire]!;

              const wire = WIRES.find((item) => item.id === draggingWire);

              if (!wire) {
                return null;
              }

              return (
                <g>
                  {/* Shadow */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={cursorPoint.x}
                    y2={cursorPoint.y}
                    stroke="rgba(0,0,0,0.55)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Wire */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={cursorPoint.x}
                    y2={cursorPoint.y}
                    stroke={wire.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </g>
              );
            })()}
        </svg>

        {/* ==========================
            Header
        ========================== */}

        <div
          className="
            relative
            z-20
          "
        >
          <div
            className="
              text-xs
              tracking-[0.35em]
              text-red-400
            "
          >
            ELECTRICAL MAINTENANCE
          </div>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
            "
          >
            ระบบจ่ายไฟประตู
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-white/50
            "
          >
            {message}
          </p>
        </div>

        {/* ==========================
            Puzzle
        ========================== */}

        <div
          className="
            relative
            z-20
            mt-8
            grid
            grid-cols-[1fr_100px_1fr]
            items-center
            gap-6
          "
        >
          {/* ======================
              LEFT WIRES
          ====================== */}

          <div
            className="
              space-y-5
            "
          >
            {WIRES.map((wire) => {
              const done = connected.has(wire.id);

              const dragging = draggingWire === wire.id;

              return (
                <div
                  key={wire.id}
                  className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      border
                      px-4
                      py-3
                      transition

                      ${
                        done
                          ? "border-emerald-500/30 bg-emerald-500/10 opacity-50"
                          : dragging
                            ? "border-white/50 bg-white/10"
                            : "border-white/10 bg-white/5"
                      }
                    `}
                >
                  <div
                    className="
                        flex
                        items-center
                        gap-3
                      "
                  >
                    <div
                      className={`
                          h-3
                          w-14
                          rounded-full
                          ${wire.className}
                        `}
                    />

                    <span>{wire.label}</span>
                  </div>

                  {/* จุดจับสาย */}

                  <div
                    ref={(element) => {
                      wireAnchorRefs.current[wire.id] = element;
                    }}
                    onPointerDown={(event) => {
                      beginDrag(wire.id, event);
                    }}
                    className={`
                        relative
                        h-7
                        w-7
                        shrink-0
                        rounded-full
                        border-4
                        border-[#101419]
                        shadow-lg

                        ${
                          done
                            ? "cursor-default bg-emerald-400"
                            : `${wire.className} cursor-grab active:cursor-grabbing`
                        }
                      `}
                  >
                    {!done && (
                      <div
                        className="
                            absolute
                            inset-[-6px]
                            rounded-full
                            border
                            border-white/10
                          "
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CENTER */}

          <div
            className="
              text-center
              text-xs
              uppercase
              tracking-[0.25em]
              text-white/20
            "
          >
            DRAG
          </div>

          {/* ======================
              RIGHT SOCKETS
          ====================== */}

          <div
            className="
              space-y-5
            "
          >
            {SOCKETS.map((socket) => {
              const wire = WIRES.find((value) => value.id === socket)!;

              const done = connected.has(socket);

              return (
                <div
                  key={socket}
                  ref={(element) => {
                    socketDropRefs.current[socket] = element;
                  }}
                  className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-lg
                      border
                      px-4
                      py-3
                      transition

                      ${
                        done
                          ? "border-emerald-400/60 bg-emerald-500/15"
                          : draggingWire
                            ? "border-white/20 bg-black/30"
                            : "border-white/10 bg-black/30"
                      }
                    `}
                >
                  <span>{done ? "CONNECTED" : "SOCKET"}</span>

                  {/* จุดปลายสาย */}

                  <div
                    ref={(element) => {
                      socketAnchorRefs.current[socket] = element;
                    }}
                    className={`
                        h-6
                        w-6
                        rounded-full
                        border-4
                        border-[#101419]
                        shadow-lg
                        ${wire.className}
                      `}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ==========================
            Footer
        ========================== */}

        <div
          className="
            relative
            z-20
            mt-8
            flex
            items-center
            justify-between
          "
        >
          <div
            className="
              text-xs
              text-white/35
            "
          >
            {connected.size}
            {" / "}
            {WIRES.length}
            {" CONNECTED"}
          </div>

          <button
            onClick={onClose}
            className="
              rounded-lg
              border
              border-white/10
              px-5
              py-2
              text-sm
              text-white/60
              hover:bg-white/5
            "
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
