import * as THREE from "three";

export function optimizeSceneDecorationTexture(texture: THREE.Texture) {
  const needsUpdate =
    texture.generateMipmaps ||
    texture.minFilter !== THREE.LinearFilter ||
    texture.magFilter !== THREE.LinearFilter;

  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  if (needsUpdate) {
    texture.needsUpdate = true;
  }
}
