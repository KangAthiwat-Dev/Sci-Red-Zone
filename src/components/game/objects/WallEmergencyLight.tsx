"use client";

import * as THREE from "three";

// ========================================
// Types
// ========================================

type WallEmergencyLightProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    intensity?: number;
    distance?: number;
    pulse?: boolean;
};

// ========================================
// Wall Emergency Light
// LOW SPEC + SOFT GLOW
// ========================================

export default function WallEmergencyLight({
    position,
    rotation = [0, 0, 0],
    scale = 1,
}: WallEmergencyLightProps) {
    return (
        <group
            position={position}
            rotation={rotation}
            scale={scale}
        >
            {/* =========================
                Wall Spill
            ========================= */}

            <mesh position={[0, 0, -0.06]}>
                <circleGeometry args={[0.32, 18]} />
                <meshBasicMaterial
                    color="#ff2a2a"
                    transparent
                    opacity={0.08}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    toneMapped={false}
                />
            </mesh>

            {/* =========================
                Wall Base
            ========================= */}

            <mesh position={[0, 0, -0.08]}>
                <cylinderGeometry args={[0.14, 0.14, 0.05, 10]} />
                <meshStandardMaterial
                    color="#16191d"
                    roughness={0.7}
                    metalness={0.35}
                />
            </mesh>

            {/* =========================
                Lamp
            ========================= */}

            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* Neck */}
                <mesh position={[0, -0.12, 0]}>
                    <cylinderGeometry args={[0.09, 0.11, 0.12, 10]} />
                    <meshStandardMaterial
                        color="#20242a"
                        roughness={0.65}
                        metalness={0.4}
                    />
                </mesh>

                {/* Bulb */}
                <mesh
                    position={[0, 0.025, 0]}
                    scale={[1, 1.25, 1]}
                >
                    <sphereGeometry args={[0.105, 12, 8]} />
                    <meshBasicMaterial
                        color="#ff3030"
                        toneMapped={false}
                    />
                </mesh>

                {/* Small Glow */}
                <mesh
                    position={[0, 0.025, 0]}
                    scale={[1.45, 1.75, 1.45]}
                >
                    <sphereGeometry args={[0.105, 10, 8]} />
                    <meshBasicMaterial
                        color="#ff3a3a"
                        transparent
                        opacity={0.16}
                        depthWrite={false}
                        side={THREE.BackSide}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>

                {/* Outer Glow */}
                <mesh
                    position={[0, 0.025, 0]}
                    scale={[2.1, 2.5, 2.1]}
                >
                    <sphereGeometry args={[0.105, 10, 8]} />
                    <meshBasicMaterial
                        color="#ff2a2a"
                        transparent
                        opacity={0.07}
                        depthWrite={false}
                        side={THREE.BackSide}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                    />
                </mesh>

                {/* Cage */}
                {[-0.075, 0, 0.075].map((x) => (
                    <mesh
                        key={x}
                        position={[x, 0.025, 0.1]}
                    >
                        <boxGeometry args={[0.009, 0.25, 0.009]} />
                        <meshBasicMaterial color="#111315" />
                    </mesh>
                ))}

                {/* Cage Ring */}
                <mesh
                    position={[0, -0.075, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <torusGeometry args={[0.11, 0.008, 4, 12]} />
                    <meshBasicMaterial color="#16191c" />
                </mesh>
            </group>
        </group>
    );
}