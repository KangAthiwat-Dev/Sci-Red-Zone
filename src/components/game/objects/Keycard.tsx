"use client";

type KeycardProps = {
    scale?: number;
};

export default function Keycard({
    scale = 1,
}: KeycardProps) {
    return (
        <group scale={scale}>
            {/* =========================
                Card Body
            ========================= */}

            <mesh
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        0.48,
                        0.3,
                        0.035,
                    ]}
                />

                <meshStandardMaterial
                    color="#d7dde3"
                    roughness={0.4}
                    metalness={0.05}
                />
            </mesh>

            {/* =========================
                Blue Header
            ========================= */}

            <mesh
                position={[
                    0,
                    0.085,
                    0.021,
                ]}
            >
                <boxGeometry
                    args={[
                        0.42,
                        0.075,
                        0.008,
                    ]}
                />

                <meshStandardMaterial
                    color="#397ec6"
                    roughness={0.45}
                />
            </mesh>

            {/* =========================
                Black Stripe
            ========================= */}

            <mesh
                position={[
                    0,
                    -0.095,
                    0.022,
                ]}
            >
                <boxGeometry
                    args={[
                        0.35,
                        0.055,
                        0.009,
                    ]}
                />

                <meshStandardMaterial
                    color="#171a1d"
                    roughness={0.7}
                />
            </mesh>

            {/* =========================
                Access Chip
            ========================= */}

            <mesh
                position={[
                    0.13,
                    0,
                    0.025,
                ]}
            >
                <boxGeometry
                    args={[
                        0.09,
                        0.075,
                        0.01,
                    ]}
                />

                <meshStandardMaterial
                    color="#c39b45"
                    roughness={0.4}
                    metalness={0.5}
                />
            </mesh>

            {/* =========================
                Status Light
            ========================= */}

            <mesh
                position={[
                    -0.17,
                    0,
                    0.028,
                ]}
            >
                <sphereGeometry
                    args={[
                        0.025,
                        12,
                        12,
                    ]}
                />

                <meshStandardMaterial
                    color="#47d9ff"
                    emissive="#1ca8ff"
                    emissiveIntensity={3}
                />
            </mesh>
        </group>
    );
}