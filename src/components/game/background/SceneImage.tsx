"use client";

import {
    useEffect,
} from "react";

import {
    useTexture,
} from "@react-three/drei";

import * as THREE from "three";

type Vector3Tuple = [
    number,
    number,
    number,
];

type SceneImageProps = {
    url: string;

    position:
        Vector3Tuple;

    size: [
        number,
        number,
    ];

    rotation?:
        Vector3Tuple;

    opacity?: number;

    flipX?: boolean;

    color?: string;

    renderOrder?: number;
};

export default function SceneImage({
    url,

    position,

    size,

    rotation = [
        0,
        0,
        0,
    ],

    opacity = 1,

    flipX = false,

    color = "#ffffff",

    renderOrder = 0,
}: SceneImageProps) {
    const texture =
        useTexture(
            url,
        );

    useEffect(() => {
        texture.colorSpace =
            THREE.SRGBColorSpace;

        texture.needsUpdate =
            true;
    }, [
        texture,
    ]);

    return (
        <mesh
            position={
                position
            }
            rotation={
                rotation
            }
            scale={[
                flipX
                    ? -1
                    : 1,

                1,

                1,
            ]}
            renderOrder={
                renderOrder
            }
        >
            <planeGeometry
                args={[
                    size[0],
                    size[1],
                ]}
            />

            <meshBasicMaterial
                map={
                    texture
                }
                color={
                    color
                }
                transparent
                opacity={
                    opacity
                }
                alphaTest={
                    0.03
                }
                side={
                    THREE.DoubleSide
                }
                depthWrite={
                    false
                }
                toneMapped={
                    false
                }
            />
        </mesh>
    );
}