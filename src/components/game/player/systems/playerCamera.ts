"use client";

import {
    useCallback,
    useRef,
} from "react";

import * as THREE from "three";

import {
    CAMERA_DISTANCE,
    CAMERA_FOLLOW_SPEED,
    CAMERA_HEIGHT,
    CAMERA_TARGET_HEIGHT,
    CAMERA_VERTICAL_SPEED,
    LOOK_AHEAD_SPEED,
    RUN_LOOK_AHEAD,
    WALK_LOOK_AHEAD,
} from "../playerConfig";

import {
    getCameraZone,
} from "./cameraZones";

// ==============================
// Types
// ==============================

type UpdatePlayerCameraOptions = {
    position: {
        x: number;
        y: number;
        z: number;
    };

    isMoving: boolean;

    direction: number;

    isRunning: boolean;

    safeDelta: number;
};

type UsePlayerCameraOptions = {
    camera: THREE.Camera;

    mapId: string;
};

// ==============================
// Player Camera
// ==============================

export function usePlayerCamera({
    camera,
    mapId,
}: UsePlayerCameraOptions) {
    // ==============================
    // Default FOV
    // ==============================

    const defaultFov =
        useRef(
            camera instanceof
                THREE.PerspectiveCamera
                ? camera.fov
                : 48,
        );

    // ==============================
    // Camera State
    // ==============================

    const cameraLookAhead =
        useRef(0);

    const cameraInitialized =
        useRef(false);

    const desiredCameraPosition =
        useRef(
            new THREE.Vector3(),
        );

    const desiredCameraTarget =
        useRef(
            new THREE.Vector3(),
        );

    const currentCameraTarget =
        useRef(
            new THREE.Vector3(),
        );

    // ==============================
    // Update Camera
    // ==============================

    const updateCamera =
        useCallback(
            ({
                position,
                isMoving,
                direction,
                isRunning,
                safeDelta,
            }: UpdatePlayerCameraOptions) => {
                // ============================
                // Camera Zone
                // ============================

                const zone =
                    getCameraZone(
                        mapId,
                        position.x,
                    );

                // ============================
                // Zone Settings
                // ============================

                const cameraHeight =
                    zone?.cameraHeight ??
                    CAMERA_HEIGHT;

                const cameraDistance =
                    zone?.cameraDistance ??
                    CAMERA_DISTANCE;

                const targetHeight =
                    zone?.targetHeight ??
                    CAMERA_TARGET_HEIGHT;

                const cameraXOffset =
                    zone?.cameraXOffset ??
                    0;

                const targetXOffset =
                    zone?.targetXOffset ??
                    0;

                const targetZ =
                    zone?.targetZ ??
                    0;

                const lookAheadScale =
                    zone?.lookAheadScale ??
                    1;

                // ============================
                // Look Ahead
                // ============================

                let targetLookAhead =
                    0;

                if (isMoving) {
                    targetLookAhead =
                        direction *
                        (
                            isRunning
                                ? RUN_LOOK_AHEAD
                                : WALK_LOOK_AHEAD
                        ) *
                        lookAheadScale;
                }

                // ============================
                // Look Ahead Smoothing
                // ============================

                const lookAheadSmoothing =
                    1 -
                    Math.exp(
                        -LOOK_AHEAD_SPEED *
                            safeDelta,
                    );

                cameraLookAhead.current =
                    THREE.MathUtils.lerp(
                        cameraLookAhead.current,

                        targetLookAhead,

                        lookAheadSmoothing,
                    );

                // ============================
                // Desired Target X
                // ============================

                const targetX =
                    zone?.fixedTargetX ??
                    (
                        position.x +
                        targetXOffset +
                        cameraLookAhead.current
                    );

                // ============================
                // Desired Target Y
                // ============================

                const targetY =
                    zone?.fixedTargetY ??
                    (
                        position.y +
                        targetHeight
                    );

                // ============================
                // Camera Target
                // ============================

                desiredCameraTarget.current.set(
                    targetX,

                    targetY,

                    targetZ,
                );

                // ============================
                // Desired Camera X
                // ============================

                const cameraX =
                    zone?.fixedCameraX ??
                    (
                        position.x +
                        cameraXOffset +
                        cameraLookAhead.current *
                            0.45
                    );

                // ============================
                // Desired Camera Y
                // ============================

                const cameraY =
                    zone?.fixedCameraY ??
                    (
                        position.y +
                        cameraHeight
                    );

                // ============================
                // Camera Position
                // ============================

                desiredCameraPosition.current.set(
                    cameraX,

                    cameraY,

                    cameraDistance,
                );

                // ============================
                // Smoothing Speed
                // ============================

                const horizontalSpeed =
                    zone?.transitionSpeed ??
                    CAMERA_FOLLOW_SPEED;

                const verticalSpeed =
                    zone?.transitionSpeed ??
                    CAMERA_VERTICAL_SPEED;

                const horizontalSmoothing =
                    1 -
                    Math.exp(
                        -horizontalSpeed *
                            safeDelta,
                    );

                const verticalSmoothing =
                    1 -
                    Math.exp(
                        -verticalSpeed *
                            safeDelta,
                    );

                // ============================
                // First Frame
                // ============================

                if (
                    !cameraInitialized.current
                ) {
                    camera.position.copy(
                        desiredCameraPosition.current,
                    );

                    currentCameraTarget.current.copy(
                        desiredCameraTarget.current,
                    );

                    // ========================
                    // Initial FOV
                    // ========================

                    if (
                        camera instanceof
                        THREE.PerspectiveCamera
                    ) {
                        camera.fov =
                            zone?.fov ??
                            defaultFov.current;

                        camera.updateProjectionMatrix();
                    }

                    camera.lookAt(
                        currentCameraTarget.current,
                    );

                    cameraInitialized.current =
                        true;

                    return;
                }

                // ============================
                // Camera Position X
                // ============================

                camera.position.x =
                    THREE.MathUtils.lerp(
                        camera.position.x,

                        desiredCameraPosition
                            .current.x,

                        horizontalSmoothing,
                    );

                // ============================
                // Camera Position Z
                // ============================

                camera.position.z =
                    THREE.MathUtils.lerp(
                        camera.position.z,

                        desiredCameraPosition
                            .current.z,

                        horizontalSmoothing,
                    );

                // ============================
                // Camera Position Y
                // ============================

                camera.position.y =
                    THREE.MathUtils.lerp(
                        camera.position.y,

                        desiredCameraPosition
                            .current.y,

                        verticalSmoothing,
                    );

                // ============================
                // Target X
                // ============================

                currentCameraTarget.current.x =
                    THREE.MathUtils.lerp(
                        currentCameraTarget
                            .current.x,

                        desiredCameraTarget
                            .current.x,

                        horizontalSmoothing,
                    );

                // ============================
                // Target Y
                // ============================

                currentCameraTarget.current.y =
                    THREE.MathUtils.lerp(
                        currentCameraTarget
                            .current.y,

                        desiredCameraTarget
                            .current.y,

                        verticalSmoothing,
                    );

                // ============================
                // Target Z
                // ============================

                currentCameraTarget.current.z =
                    THREE.MathUtils.lerp(
                        currentCameraTarget
                            .current.z,

                        desiredCameraTarget
                            .current.z,

                        horizontalSmoothing,
                    );

                // ============================
                // FOV / Zoom
                // ============================

                if (
                    camera instanceof
                    THREE.PerspectiveCamera
                ) {
                    const targetFov =
                        zone?.fov ??
                        defaultFov.current;

                    camera.fov =
                        THREE.MathUtils.lerp(
                            camera.fov,

                            targetFov,

                            horizontalSmoothing,
                        );

                    camera.updateProjectionMatrix();
                }

                // ============================
                // Look At
                // ============================

                camera.lookAt(
                    currentCameraTarget.current,
                );
            },
            [
                camera,
                mapId,
            ],
        );

    return {
        updateCamera,
    };
}