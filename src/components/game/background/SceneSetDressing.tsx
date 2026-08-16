"use client";

import SceneImage from "./SceneImage";

import { SET_DRESSING, type SceneMapId } from "./setDressingConfig";

type SceneSetDressingProps = {
  mapId: SceneMapId;
};

export default function SceneSetDressing({ mapId }: SceneSetDressingProps) {
  const config = SET_DRESSING[mapId];

  return (
    <>
      {/* =========================
                Background
            ========================= */}

      {config.background.map((item, index) => (
        <SceneImage key={`background-${index}`} {...item} />
      ))}

      {/* =========================
                Midground
            ========================= */}

      {config.midground.map((item, index) => (
        <SceneImage key={`midground-${index}`} {...item} />
      ))}

      {/* =========================
                Foreground
            ========================= */}

      {config.foreground.map((item, index) => (
        <SceneImage key={`foreground-${index}`} {...item} />
      ))}
    </>
  );
}
