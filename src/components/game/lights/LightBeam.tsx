"use client";

import {
    useEffect,
    useMemo,
    useRef,
} from "react";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";

type Vector3Tuple = [
    number,
    number,
    number,
];

type LightBeamProps = {
    position: Vector3Tuple;
    target: Vector3Tuple;

    color?: string;

    // แสงจริงที่ตกกระทบฉาก
    intensity?: number;
    distance?: number;
    angle?: number;
    penumbra?: number;

    // ความกว้างของลำแสงที่มองเห็น
    outerRadius?: number;

    // ความชัดของลำแสงในอากาศ
    beamOpacity?: number;

    castShadow?: boolean;
    shadowMapSize?: number;

    // สำหรับไฟเสีย
    flicker?: boolean;
};

export default function LightBeam({
    position,
    target,

    color = "#c9dcff",

    intensity = 30,
    distance = 15,
    angle = 0.32,
    penumbra = 0.75,

    outerRadius = 2.8,
    beamOpacity = 0.07,

    castShadow = false,
    shadowMapSize = 1024,

    flicker = false,
}: LightBeamProps) {
    const spotLightRef =
        useRef<THREE.SpotLight>(null);

    const targetRef =
        useRef<THREE.Object3D>(null);

    const outerMaterialRef =
        useRef<THREE.MeshBasicMaterial>(
            null,
        );

    const innerMaterialRef =
        useRef<THREE.MeshBasicMaterial>(
            null,
        );

    // ========================================
    // คำนวณตำแหน่งและการหมุนของ Beam
    // ========================================

    const beamTransform = useMemo(() => {
        const start =
            new THREE.Vector3(...position);

        const end =
            new THREE.Vector3(...target);

        const direction =
            new THREE.Vector3().subVectors(
                end,
                start,
            );

        const length =
            Math.max(
                direction.length(),
                0.001,
            );

        direction.normalize();

        const midpoint =
            start
                .clone()
                .add(end)
                .multiplyScalar(0.5);

        /*
         * CylinderGeometry ยาวตามแกน Y
         *
         * หมุนแกน Y ให้ชี้จาก
         * source → target
         */
        const quaternion =
            new THREE.Quaternion()
                .setFromUnitVectors(
                    new THREE.Vector3(
                        0,
                        -1,
                        0,
                    ),
                    direction,
                );

        return {
            length,
            midpoint,
            quaternion,
        };
    }, [position, target]);

    // ========================================
    // SpotLight Target
    // ========================================

    useEffect(() => {
        const light =
            spotLightRef.current;

        const lightTarget =
            targetRef.current;

        if (
            !light ||
            !lightTarget
        ) {
            return;
        }

        light.target = lightTarget;

        lightTarget.updateMatrixWorld(
            true,
        );

        light.updateMatrixWorld(true);
    }, [target]);

    // ========================================
    // Flickering
    // ========================================

    useFrame(({ clock }) => {
        if (!flicker) {
            return;
        }

        const light =
            spotLightRef.current;

        if (!light) {
            return;
        }

        const t =
            clock.elapsedTime;

        /*
         * ใช้หลาย wave ซ้อนกัน
         * เพื่อไม่ให้กระพริบเป็นจังหวะ
         * แบบ disco
         */
        const irregular =
            0.88 +
            Math.sin(t * 11.7) *
            0.08 +
            Math.sin(t * 23.4) *
            0.04 +
            Math.sin(t * 41.1) *
            0.025;

        /*
         * บางช่วงดับวูบ
         */
        const shortDrop =
            Math.sin(t * 31.7) >
                0.94
                ? 0.18
                : 1;

        const brightness =
            Math.max(
                0.08,
                irregular *
                shortDrop,
            );

        light.intensity =
            intensity *
            brightness;

        if (
            outerMaterialRef.current
        ) {
            outerMaterialRef.current.opacity =
                beamOpacity *
                brightness;
        }

        if (
            innerMaterialRef.current
        ) {
            innerMaterialRef.current.opacity =
                beamOpacity *
                0.45 *
                brightness;
        }
    });

    const shadowFar =
        Math.max(
            distance,
            beamTransform.length + 2,
        );

    const triangleBeamTexture = useMemo(() => {
        if (typeof document === "undefined") {
            const fallback =
                new THREE.Texture();

            fallback.needsUpdate = true;

            return fallback;
        }
        const canvas =
            document.createElement("canvas");

        canvas.width = 512;
        canvas.height = 1024;

        const ctx =
            canvas.getContext("2d");

        if (!ctx) {
            const fallback =
                new THREE.Texture();

            fallback.needsUpdate = true;
            return fallback;
        }

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height,
        );

        ctx.filter = "blur(14px)";

        for (
            let y = 0;
            y < canvas.height;
            y += 2
        ) {
            const t =
                y / canvas.height;

            const center =
                canvas.width / 2;

            // ด้านบนแคบ ด้านล่างกว้าง
            const halfWidth =
                6 +
                Math.pow(t, 1.35) *
                canvas.width *
                0.32;

            const gradient =
                ctx.createLinearGradient(
                    center - halfWidth,
                    0,
                    center + halfWidth,
                    0,
                );

            const edgeAlpha =
                0.05 + t * 0.08;

            const midAlpha =
                0.12 +
                Math.max(
                    0,
                    0.55 -
                    Math.abs(t - 0.55),
                ) *
                0.9;

            gradient.addColorStop(
                0,
                "rgba(255,255,255,0)",
            );
            gradient.addColorStop(
                0.18,
                `rgba(255,255,255,${edgeAlpha})`,
            );
            gradient.addColorStop(
                0.5,
                `rgba(255,255,255,${midAlpha})`,
            );
            gradient.addColorStop(
                0.82,
                `rgba(255,255,255,${edgeAlpha})`,
            );
            gradient.addColorStop(
                1,
                "rgba(255,255,255,0)",
            );

            ctx.fillStyle = gradient;
            ctx.fillRect(
                center - halfWidth,
                y,
                halfWidth * 2,
                3,
            );
        }

        // fade บน/ล่าง
        ctx.globalCompositeOperation =
            "destination-in";

        const verticalFade =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height,
            );

        verticalFade.addColorStop(
            0,
            "rgba(255,255,255,0)",
        );
        verticalFade.addColorStop(
            0.08,
            "rgba(255,255,255,0.35)",
        );
        verticalFade.addColorStop(
            0.4,
            "rgba(255,255,255,1)",
        );
        verticalFade.addColorStop(
            0.82,
            "rgba(255,255,255,0.55)",
        );
        verticalFade.addColorStop(
            1,
            "rgba(255,255,255,0)",
        );

        ctx.fillStyle = verticalFade;
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height,
        );

        const texture =
            new THREE.CanvasTexture(
                canvas,
            );

        texture.colorSpace =
            THREE.SRGBColorSpace;
        texture.wrapS =
            THREE.ClampToEdgeWrapping;
        texture.wrapT =
            THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;

        return texture;
    }, []);

    // ========================================
    // Cleanup Beam Texture
    // ใส่ตรงนี้
    // ========================================

    useEffect(() => {
        return () => {
            triangleBeamTexture.dispose();
        };
    }, [triangleBeamTexture]);

    return (
        <>
            {/* =================================
                Actual Light
            ================================= */}

            <spotLight
                ref={spotLightRef}
                position={position}
                color={color}
                intensity={intensity}
                distance={distance}
                angle={angle}
                penumbra={penumbra}
                decay={2}
                castShadow={
                    castShadow
                }
                shadow-mapSize-width={
                    shadowMapSize
                }
                shadow-mapSize-height={
                    shadowMapSize
                }
                shadow-camera-near={
                    0.1
                }
                shadow-camera-far={
                    shadowFar
                }
                shadow-bias={
                    -0.0002
                }
                shadow-normalBias={
                    0.02
                }
            />

            {/* Target ต้องอยู่ใน Scene */}
            <object3D
                ref={targetRef}
                position={target}
            />

            <group
                position={beamTransform.midpoint}
                quaternion={beamTransform.quaternion}
                renderOrder={1}
                frustumCulled={false}
            >
                {/* ชั้นหลัก */}
                <mesh>
                    <planeGeometry
                        args={[
                            outerRadius * 2.6,
                            beamTransform.length * 1.15,
                        ]}
                    />

                    <meshBasicMaterial
                        ref={outerMaterialRef}
                        map={triangleBeamTexture}
                        color={color}
                        transparent
                        opacity={beamOpacity}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                        fog={true}
                    />
                </mesh>

                {/* ชั้นรองให้ฟุ้งขึ้น */}
                <mesh
                    rotation={[
                        0,
                        Math.PI / 16,
                        0,
                    ]}
                >
                    <planeGeometry
                        args={[
                            outerRadius * 2.1,
                            beamTransform.length * 1.1,
                        ]}
                    />

                    <meshBasicMaterial
                        ref={innerMaterialRef}
                        map={triangleBeamTexture}
                        color={color}
                        transparent
                        opacity={beamOpacity * 0.45}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        toneMapped={false}
                        fog={true}
                    />
                </mesh>
            </group>
        </>
    );
}