"use client"

import { useEffect, useState } from "react";

// useMediaSync.ts
export const useMediaSync = (
    videoRef: React.RefObject<HTMLVideoElement>,
    audioRefs: React.RefObject<HTMLAudioElement>[],
    playbackRate: number,
    isSpeedAutomated: boolean,
    updateAutomatedSpeed: (time: number) => void
) => {
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(0.1);

    // Sync playback rate
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = playbackRate;
        audioRefs.forEach(ref => {
            if (ref.current) ref.current.playbackRate = playbackRate;
        });
    }, [playbackRate, videoRef, audioRefs]);

    // Sync play/pause
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const syncAudio = (): void => {
            audioRefs.forEach(ref => {
                const audio = ref.current;
                if (!audio) return;

                if (video.paused) {
                    audio.pause();
                } else {
                    audio.play().catch(e => console.error("Audio play failed:", e));
                }
            });
        };

        video.addEventListener("play", syncAudio);
        video.addEventListener("pause", syncAudio);

        return () => {
            video.removeEventListener("play", syncAudio);
            video.removeEventListener("pause", syncAudio);
        };
    }, [videoRef, audioRefs]);

    // Time tracking
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const checkTime = (): void => {
            if (video.currentTime !== currentTimestamp) {
                setCurrentTimestamp(video.currentTime);

                if (isSpeedAutomated) {
                    updateAutomatedSpeed(video.currentTime);
                }
            }
        };

        const interval = setInterval(checkTime, 100);
        return () => clearInterval(interval);
    }, [currentTimestamp, isSpeedAutomated, updateAutomatedSpeed, videoRef]);

    return {
        currentTimestamp,
        setCurrentTimestamp,

        playPause: (action: "play" | "pause") => {
            const video = videoRef.current;
            if (!video) return;

            if (action === "play") {
                video.play();
            } else {
                video.pause();
            }
            setCurrentTimestamp(video.currentTime);
        },

        seek: (time: number) => {
            const video = videoRef.current;
            if (!video) return;

            video.currentTime = time;
            audioRefs.forEach(ref => {
                if (ref.current) ref.current.currentTime = time;
            });

            setCurrentTimestamp(time);
            if (isSpeedAutomated) {
                updateAutomatedSpeed(time);
            }
        },

        skip: (seconds: number, duration: number) => {
            const video = videoRef.current;
            if (!video) return;

            const currentTime = video.currentTime;
            const newTime = seconds > 0
                ? Math.min(currentTime + seconds, duration)
                : Math.max(currentTime + seconds, 0);

            video.currentTime = newTime;
            audioRefs.forEach(ref => {
                if (ref.current) ref.current.currentTime = newTime;
            });

            setCurrentTimestamp(newTime);
            if (isSpeedAutomated) {
                updateAutomatedSpeed(newTime);
            }
        }
    };
};