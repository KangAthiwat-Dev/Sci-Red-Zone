"use client";

type WoodenCrateProps = {
    width?: number;
    height?: number;
    depth?: number;
};

export default function WoodenCrate({
    width = 1.3,
    height = 1.2,
    depth = 1.0,
}: WoodenCrateProps) {
    const frameThickness = 0.09;

    return (
        <group>
            {/* =================================
                Main wooden box
            ================================= */}

            <mesh
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        width,
                        height,
                        depth,
                    ]}
                />

                <meshStandardMaterial
                    color="#714526"
                    roughness={0.9}
                    metalness={0}
                />
            </mesh>

            {/* =================================
                Front frame
            ================================= */}

            {/* บน */}
            <mesh
                position={[
                    0,
                    height / 2 -
                        frameThickness / 2,
                    depth / 2 + 0.015,
                ]}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        width,
                        frameThickness,
                        0.07,
                    ]}
                />

                <meshStandardMaterial
                    color="#4b2b18"
                    roughness={0.85}
                />
            </mesh>

            {/* ล่าง */}
            <mesh
                position={[
                    0,
                    -height / 2 +
                        frameThickness / 2,
                    depth / 2 + 0.015,
                ]}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        width,
                        frameThickness,
                        0.07,
                    ]}
                />

                <meshStandardMaterial
                    color="#4b2b18"
                    roughness={0.85}
                />
            </mesh>

            {/* ซ้าย */}
            <mesh
                position={[
                    -width / 2 +
                        frameThickness / 2,
                    0,
                    depth / 2 + 0.015,
                ]}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        frameThickness,
                        height,
                        0.07,
                    ]}
                />

                <meshStandardMaterial
                    color="#4b2b18"
                    roughness={0.85}
                />
            </mesh>

            {/* ขวา */}
            <mesh
                position={[
                    width / 2 -
                        frameThickness / 2,
                    0,
                    depth / 2 + 0.015,
                ]}
                castShadow
                receiveShadow
            >
                <boxGeometry
                    args={[
                        frameThickness,
                        height,
                        0.07,
                    ]}
                />

                <meshStandardMaterial
                    color="#4b2b18"
                    roughness={0.85}
                />
            </mesh>

            {/* =================================
                Diagonal wooden braces

                ทำให้ดูเป็นลังไม้มากขึ้น
            ================================= */}

            <mesh
                position={[
                    0,
                    0,
                    depth / 2 + 0.055,
                ]}
                rotation={[
                    0,
                    0,
                    Math.PI / 4.7,
                ]}
                castShadow
            >
                <boxGeometry
                    args={[
                        width * 1.15,
                        0.1,
                        0.06,
                    ]}
                />

                <meshStandardMaterial
                    color="#56331d"
                    roughness={0.9}
                />
            </mesh>

            <mesh
                position={[
                    0,
                    0,
                    depth / 2 + 0.06,
                ]}
                rotation={[
                    0,
                    0,
                    -Math.PI / 4.7,
                ]}
                castShadow
            >
                <boxGeometry
                    args={[
                        width * 1.15,
                        0.1,
                        0.06,
                    ]}
                />

                <meshStandardMaterial
                    color="#56331d"
                    roughness={0.9}
                />
            </mesh>

            {/* =================================
                Top boards
            ================================= */}

            {[-0.35, 0, 0.35].map(
                (z) => (
                    <mesh
                        key={z}
                        position={[
                            0,
                            height / 2 +
                                0.025,
                            z,
                        ]}
                        castShadow
                        receiveShadow
                    >
                        <boxGeometry
                            args={[
                                width * 0.92,
                                0.05,
                                0.25,
                            ]}
                        />

                        <meshStandardMaterial
                            color="#845432"
                            roughness={0.95}
                        />
                    </mesh>
                ),
            )}
        </group>
    );
}