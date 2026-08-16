"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type WallEmergencyLightProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    intensity?: number;
    distance?: number;
    pulse?: boolean;
};

export default function WallEmergencyLight({
    position,
    rotation = [0, 0, 0],
    scale = 1,
    intensity = 30,
    distance = 30,
    pulse = true,
}: WallEmergencyLightProps) {
    const bulbMatRef =
        useRef<THREE.MeshStandardMaterial>(null);

    const glowMatRef =
        useRef<THREE.MeshBasicMaterial>(null);

    const lightRef =
        useRef<THREE.PointLight>(null);

    useFrame(({ clock }) => {
        if (!pulse) return;

        const t = clock.elapsedTime;
        const flicker =
            0.85 + Math.sin(t * 3.2) * 0.15;

        if (bulbMatRef.current) {
            bulbMatRef.current.emissiveIntensity =
                3 + flicker * 3;
        }

        if (glowMatRef.current) {
            glowMatRef.current.opacity =
                0.25 + flicker * 0.2;
        }

        if (lightRef.current) {
            lightRef.current.intensity =
                intensity * flicker;
        }
    });

    // จำนวนซี่กรงแนวตั้ง (ตามผิวทรงกลม)
    const cageRibCount = 5;
    const cageRibs = Array.from({ length: cageRibCount }, (_, i) => {
        const angle = (i / cageRibCount) * Math.PI * 2;
        return angle;
    });

    return (
        <group
            position={position}
            rotation={rotation}
            scale={scale}
        >
            {/* ฐานติดกำแพง (แผ่นแบนแนบผนัง) */}
            <mesh position={[0, 0, -0.1]} castShadow receiveShadow>
                <cylinderGeometry args={[0.145, 0.145, 0.05, 24]} />
                <meshStandardMaterial
                    color="#16181b"
                    roughness={0.55}
                    metalness={0.6}
                />
            </mesh>

            {/* หมุนให้เป็นแนวนอน ยื่นออกจากกำแพง */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* ฐานคอโคมทรงกระบอกสั้น เชื่อมจากผนังสู่โดม */}
                <mesh position={[0, -0.16, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.1, 0.115, 0.12, 24]} />
                    <meshStandardMaterial
                        color="#1c1f23"
                        roughness={0.5}
                        metalness={0.65}
                    />
                </mesh>

                {/* ปกครอบคอ (แหวนคั่นระหว่างฐานกับโดม) */}
                <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.118, 0.118, 0.02, 24]} />
                    <meshStandardMaterial
                        color="#2a2e33"
                        roughness={0.45}
                        metalness={0.7}
                    />
                </mesh>

                {/* โดมกระจกแดง: ทรงแคปซูล = กระบอกสั้น + ปลายมนครึ่งวงกลม */}
                <group position={[0, 0.02, 0]}>
                    {/* ลำตัวทรงกระบอกของโดม */}
                    <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.1, 0.1, 0.1, 32, 1, true]} />
                        <meshStandardMaterial
                            ref={bulbMatRef}
                            color="#ff3b3b"
                            emissive="#ff1414"
                            emissiveIntensity={5}
                            roughness={0.2}
                            metalness={0.05}
                            transparent
                            opacity={0.9}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* ปลายมนด้านบน (ครึ่งทรงกลม) */}
                    <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                        <sphereGeometry args={[0.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial
                            color="#ff3b3b"
                            emissive="#ff1414"
                            emissiveIntensity={5}
                            roughness={0.2}
                            metalness={0.05}
                            transparent
                            opacity={0.9}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* ปิดก้นโดมด้านล่าง (แนบกับปกครอบคอ) */}
                    <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                        <circleGeometry args={[0.1, 32]} />
                        <meshStandardMaterial
                            color="#ff3b3b"
                            emissive="#ff1414"
                            emissiveIntensity={5}
                            roughness={0.2}
                            metalness={0.05}
                            transparent
                            opacity={0.9}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* ชั้น glow ฟุ้งรอบโดม เพื่อให้ดูเรืองแสงแบบในภาพอ้างอิง */}
                    <mesh position={[0, 0.05, 0]} scale={1.35}>
                        <sphereGeometry args={[0.1, 24, 16]} />
                        <meshBasicMaterial
                            ref={glowMatRef}
                            color="#ff2020"
                            transparent
                            opacity={0.3}
                            depthWrite={false}
                            side={THREE.BackSide}
                        />
                    </mesh>
                </group>

                {/* กรงเหล็กครอบโดม: ซี่แนวตั้งโค้งตามผิวทรงกลม/แคปซูล */}
                {cageRibs.map((angle, i) => {
                    const radius = 0.105;
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;
                    // เอียงซี่กรงให้ปลายบนโน้มเข้าหาแกนกลาง (โค้งตามโดม)
                    const tiltZ = -Math.cos(angle) * 0.35;
                    const tiltX = Math.sin(angle) * 0.35;
                    return (
                        <group key={i} position={[x, 0.02, z]} rotation={[tiltX, 0, tiltZ]}>
                            <mesh castShadow>
                                <capsuleGeometry args={[0.006, 0.19, 4, 8]} />
                                <meshStandardMaterial
                                    color="#151719"
                                    roughness={0.5}
                                    metalness={0.75}
                                />
                            </mesh>
                        </group>
                    );
                })}

                {/* ห่วงกรงแนวนอน (rings) รอบโดม */}
                {[0.0, 0.045, 0.09].map((y, i) => {
                    const ringRadius = 0.104 * Math.cos((y / 0.13) * (Math.PI / 2) * 0.7);
                    return (
                        <mesh
                            key={i}
                            position={[0, y + 0.02, 0]}
                            rotation={[Math.PI / 2, 0, 0]}
                        >
                            <torusGeometry args={[Math.max(ringRadius, 0.05), 0.006, 8, 24]} />
                            <meshStandardMaterial
                                color="#151719"
                                roughness={0.5}
                                metalness={0.75}
                            />
                        </mesh>
                    );
                })}

                {/* ห่วงยึดกรงด้านล่างสุด (ติดกับปกครอบคอ) */}
                <mesh position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.108, 0.008, 8, 24]} />
                    <meshStandardMaterial
                        color="#1c1f23"
                        roughness={0.45}
                        metalness={0.7}
                    />
                </mesh>
            </group>

            {/* แสงจริง ยิงออกจากปลายโดม */}
            <pointLight
                ref={lightRef}
                position={[0, 0, 1]}
                color="#ff2a2a"
                intensity={intensity}
                distance={distance}
                decay={2}
            />
        </group>
    );
}