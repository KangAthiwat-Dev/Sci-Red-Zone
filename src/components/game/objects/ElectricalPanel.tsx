"use client";

type ElectricalPanelProps = {
    completed?: boolean;

    scale?: number;
};

export default function ElectricalPanel({
    completed = false,
    scale = 1,
}: ElectricalPanelProps) {
    return (
        <group scale={scale}>
            {/* =================================
                Main Metal Box
            ================================= */}

            <mesh
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        1.15,
                        1.55,
                        0.24,
                    ]}
                />

                <meshStandardMaterial
                    color="#2c3033"
                    roughness={0.72}
                    metalness={0.35}
                />
            </mesh>

            {/* =================================
                Inner Panel
            ================================= */}

            <mesh
                position={[
                    0,
                    0,
                    0.135,
                ]}
            >
                <boxGeometry
                    args={[
                        0.95,
                        1.32,
                        0.035,
                    ]}
                />

                <meshStandardMaterial
                    color="#151719"
                    roughness={0.85}
                    metalness={0.1}
                />
            </mesh>

            {/* =================================
                Top Warning Strip
            ================================= */}

            <mesh
                position={[
                    0,
                    0.58,
                    0.165,
                ]}
            >
                <boxGeometry
                    args={[
                        0.8,
                        0.12,
                        0.025,
                    ]}
                />

                <meshStandardMaterial
                    color="#c69b28"
                    roughness={0.75}
                />
            </mesh>

            {/* =================================
                Fuse / Circuit Breakers
            ================================= */}

            {[
                -0.32,
                -0.1,
                0.12,
                0.34,
            ].map((x) => (
                <group
                    key={x}
                    position={[
                        x,
                        0.3,
                        0.185,
                    ]}
                >
                    <mesh>
                        <boxGeometry
                            args={[
                                0.14,
                                0.28,
                                0.08,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#444a4f"
                            roughness={0.7}
                            metalness={0.15}
                        />
                    </mesh>

                    <mesh
                        position={[
                            0,
                            0.03,
                            0.055,
                        ]}
                    >
                        <boxGeometry
                            args={[
                                0.055,
                                0.11,
                                0.035,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#1e2124"
                            roughness={0.8}
                        />
                    </mesh>
                </group>
            ))}

            {/* =================================
                Wires
            ================================= */}

            {/* Red */}
            <mesh
                position={[
                    -0.27,
                    -0.15,
                    0.2,
                ]}
                rotation={[
                    0,
                    0,
                    -0.22,
                ]}
            >
                <cylinderGeometry
                    args={[
                        0.025,
                        0.025,
                        0.62,
                        10,
                    ]}
                />

                <meshStandardMaterial
                    color="#c83b3b"
                    roughness={0.65}
                />
            </mesh>

            {/* Blue */}
            <mesh
                position={[
                    0,
                    -0.18,
                    0.205,
                ]}
                rotation={[
                    0,
                    0,
                    0.13,
                ]}
            >
                <cylinderGeometry
                    args={[
                        0.025,
                        0.025,
                        0.68,
                        10,
                    ]}
                />

                <meshStandardMaterial
                    color="#377bc8"
                    roughness={0.65}
                />
            </mesh>

            {/* Yellow */}
            <mesh
                position={[
                    0.27,
                    -0.14,
                    0.2,
                ]}
                rotation={[
                    0,
                    0,
                    0.27,
                ]}
            >
                <cylinderGeometry
                    args={[
                        0.025,
                        0.025,
                        0.64,
                        10,
                    ]}
                />

                <meshStandardMaterial
                    color="#d6ad38"
                    roughness={0.65}
                />
            </mesh>

            {/* =================================
                Terminal Row
            ================================= */}

            {[
                -0.27,
                0,
                0.27,
            ].map((x) => (
                <mesh
                    key={x}
                    position={[
                        x,
                        -0.5,
                        0.205,
                    ]}
                    rotation={[
                        Math.PI / 2,
                        0,
                        0,
                    ]}
                >
                    <cylinderGeometry
                        args={[
                            0.07,
                            0.07,
                            0.055,
                            16,
                        ]}
                    />

                    <meshStandardMaterial
                        color="#555d63"
                        roughness={0.65}
                        metalness={0.45}
                    />
                </mesh>
            ))}

            {/* =================================
                Status Light
            ================================= */}

            <mesh
                position={[
                    0.38,
                    0.58,
                    0.21,
                ]}
            >
                <sphereGeometry
                    args={[
                        0.055,
                        16,
                        16,
                    ]}
                />

                <meshStandardMaterial
                    color={
                        completed
                            ? "#43ff83"
                            : "#ff3737"
                    }
                    emissive={
                        completed
                            ? "#18ff63"
                            : "#ff1010"
                    }
                    emissiveIntensity={4}
                    roughness={0.2}
                />
            </mesh>

            {/* =================================
                Handle
            ================================= */}

            <mesh
                position={[
                    0.49,
                    0,
                    0.2,
                ]}
            >
                <boxGeometry
                    args={[
                        0.055,
                        0.38,
                        0.075,
                    ]}
                />

                <meshStandardMaterial
                    color="#131517"
                    roughness={0.6}
                    metalness={0.5}
                />
            </mesh>
        </group>
    );
}