"use client";

import SceneImage from "./SceneImage";

import { SCENE_DRESSING, type SceneDecorationMap } from "./setDressingConfig";

type SceneSetDressingProps = {
  mapId: keyof SceneDecorationMap;
};

export default function SceneSetDressing({ mapId }: SceneSetDressingProps) {
  const decorations = SCENE_DRESSING[mapId] ?? [];

  return (
    <>
      {decorations.map((decoration) => (
        <SceneImage
          key={decoration.id}
          src={decoration.src}
          position={decoration.position}
          size={decoration.size}
          rotation={decoration.rotation}
          opacity={decoration.opacity}
          flipX={decoration.flipX}
          renderOrder={decoration.renderOrder}
        />
      ))}
    </>
  );
}
