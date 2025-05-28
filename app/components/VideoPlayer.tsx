// ./app/components/VideoPlayer.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import MuxPlayer from "@mux/mux-player-react";
import MuxPlayerElement from "@mux/mux-player";
import EMACard from "./EMACard";
import { AudioControls, VideoMetadata, VideoPlayerProps, VideoPlayerSettings, EMAQuestion, EMAState } from "../api/types";
import { logAction } from "@/lib/logAction";
import { EMA_QUESTIONS } from "../api/EMAQuestions";
import IconButton from "./IconButton";
import HelpPopup from "./HelpPopup";
import VolumeControls from "./VolumeControls";
import CaptionControls from "./CaptionControls";
import FullscreenControls from "./FullscreenControls";
import PlaybackSpeedControls from "./PlaybackSpeedControls";
import SpotlightControls from "./SpotlightControls";
// import Video from "next-video";

const VideoPlayer = ({ videoName, muxAssetId }: VideoPlayerProps): JSX.Element => {
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSpeedAutomated, setIsSpeedAutomated] = useState<boolean>(false);
    const [manualPlaybackRate, setManualPlaybackRate] = useState<number>(1);
    const [isUserActive, setIsUserActive] = useState<boolean>(true);
    const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const basePath = `/${videoName}/${videoName}`;
    const videoSrc = muxAssetId?.original;
    const highlightSrc = muxAssetId?.highlight;
    const speakerSrc = `${basePath}_speaker.mp3`;
    const musicSrc = `${basePath}_music.mp3`;
    const otherSrc = `${basePath}_other.mp3`;
    const defaultCaptionsSrc = `${basePath}.vtt`;
    const simplifiedCaptionsSrc = `${basePath}.vtt`;
    // const simplifiedCaptionsSrc = `${basePath}_simplified.vtt`;

    // const localVideoSrc = `${basePath}.mp4`
    // const localHighlightSrc = `${basePath}.mp4`
    // const [useLocalVideo] = useState<boolean>(!muxAssetId?.original);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const speakerRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const otherRef = useRef<HTMLAudioElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);
    const muxPlayerRef = useRef<MuxPlayerElement | null>(null); // mux

    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(0.1);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [highlight, setHighlight] = useState<boolean>(false);
    const [showVideo, setShowVideo] = useState<boolean>(true);
    const [captionMode, setCaptionMode] = useState<"none" | "default" | "simplified">("none");
    const [speakerControl, setSpeakerControl] = useState<AudioControls>({ volume: 1, muted: false, prevVolume: 1 });
    const [musicControl, setMusicControl] = useState<AudioControls>({ volume: 1, muted: false, prevVolume: 1 });
    const [otherControl, setOtherControl] = useState<AudioControls>({ volume: 1, muted: false, prevVolume: 1 });
    const [currentMuxAssetId, setCurrentMuxAssetId] = useState<string | undefined>(muxAssetId?.original); // mux
    const [isMuxPlayerLoaded, setIsMuxPlayerLoaded] = useState<boolean>(false); // mux

    const [ema, setEma] = useState<EMAState>({ isOpen: false, currentQuestion: null, lastAction: "general" });
    const [userName, setUserName] = useState<string>("");
    const [lastAction, setLastAction] = useState<string>("general");
    const [helpPopup, setHelpPopup] = useState<{ isOpen: boolean; title: string; content: string; section: string }>({ isOpen: false, title: "", content: "", section: "" });

    const handleOpenHelp = (section: string) => {
        let title = "";
        let content = "";

        switch (section) {
            case "captions":
                title = "Captions Help";
                content = "Captions show <strong>dialogue</strong> as <strong>text</strong>. You can turn captions <strong>ON</strong> or <strong>OFF</strong>, or switch to a <strong>simplified version</strong>.";
                break;
            case "spotlight":
                title = "Spotlight Help";
                content = "Spotlight <strong>highlights</strong> the <strong>current speaker</strong>. You can turn spotlight <strong>ON</strong> or <strong>OFF</strong>.";
                break;
            case "speed":
                title = "Playback Speed Help";
                content = "Playback speed controls <strong>how fast</strong> the <strong>video</strong> is playing. You can <strong>speed up</strong> or <strong>slow down</strong> the video. You can also make the <strong>system automate</strong> the <strong>speed</strong>.";
                break;
            case "volume":
                title = "Volume Controls Help";
                content = "Volume controls <strong>how loud</strong> different <strong>audio</strong> is. You can <strong>control</strong> the <strong>speaker</strong>, <strong>music</strong> and <strong>background</strong> audio. You can also <strong>mute</strong> audio you do not want.";
                break;
            default:
                title = "Help";
                content = "Need assistance with the video player controls?";
        }

        setHelpPopup({ isOpen: true, title, content, section });
        handleLogging(`Opened help for ${section} controls.`);
    };

    const handleCloseHelp = () => {
        setHelpPopup(prev => ({ ...prev, isOpen: false }));
        handleLogging(`Closed help popup for ${helpPopup.section} controls.`);
    };

    const handleLogging = (action: string, category: string = "general") => {
        if (typeof window !== "undefined") {
            const name = localStorage.getItem("ca11yDeploymentName");
            setLastAction(category);

            if (name) {
                setUserName(name);
                logAction(name, action)
            } else {
                console.error("No ca11yDeploymentName stored.")
            };
        }
    }

    useEffect(() => {
        const handleUserActivity = () => {
            setIsUserActive(true);

            if (activityTimerRef.current) {
                clearTimeout(activityTimerRef.current);
            }

            activityTimerRef.current = setTimeout(() => {
                setIsUserActive(false);
            }, 2000);
        };

        if (isFullScreen) {
            handleUserActivity();

            document.addEventListener("mousemove", handleUserActivity);
            document.addEventListener("keydown", handleUserActivity);
            document.addEventListener("click", handleUserActivity);
            document.addEventListener("touchstart", handleUserActivity);

            return () => {
                document.removeEventListener("mousemove", handleUserActivity);
                document.removeEventListener("keydown", handleUserActivity);
                document.removeEventListener("click", handleUserActivity);
                document.removeEventListener("touchstart", handleUserActivity);

                if (activityTimerRef.current) {
                    clearTimeout(activityTimerRef.current);
                    activityTimerRef.current = null;
                }
            };
        } else {
            setIsUserActive(true);
            if (activityTimerRef.current) {
                clearTimeout(activityTimerRef.current);
                activityTimerRef.current = null;
            }
        }
    }, [isFullScreen]);

    const getEMAQuestion = (actionCategory: string): EMAQuestion => {
        const matchingQuestions = EMA_QUESTIONS.filter(q => q.condition === actionCategory);
        if (matchingQuestions.length > 0) {
            return matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
        }

        return EMA_QUESTIONS.find(q => q.condition === "general") || EMA_QUESTIONS[0];
    };

    const handleEMAClose = () => {
        setEma(prev => ({ ...prev, isOpen: false }));
    };

    const updateCaptionsMode = (mode: "none" | "default" | "simplified") => {
        const video = videoRef.current;
        if (!video) {
            return;
        };
        for (let i = 0; i < video.textTracks.length; i++) {
            const track = video.textTracks[i];
            if (track.label === "Default English") {
                track.mode = mode === "default" ? "showing" : "hidden";
            } else if (track.label === "Simplified English") {
                track.mode = mode === "simplified" ? "showing" : "hidden";
            }
        }
        setCaptionMode(mode);
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await fetch(`/${videoName}/${videoName}.json`);
                if (!res.ok) throw new Error("Failed to load metadata");
                const data: VideoMetadata = await res.json();
                setMetadata(data);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [videoName]);

    // useEffect(() => {
    //     if (typeof window !== "undefined") {
    //         const savedSettings = localStorage.getItem("ca11ySettings");

    //         if (!savedSettings) console.error("No ca11ySettings stored.")

    //         if (savedSettings) {
    //             const settings: VideoPlayerSettings = JSON.parse(savedSettings);
    //             setCaptionMode(settings.captionMode);
    //             setPlaybackRate(settings.playbackRate);
    //             setManualPlaybackRate(settings.manualPlaybackRate);
    //             setIsSpeedAutomated(settings.isSpeedAutomated);
    //             setSpeakerControl(settings.speakerControl);
    //             setMusicControl(settings.musicControl);
    //             setOtherControl(settings.otherControl);

    //             if (settings.highlight) {
    //                 setHighlight(true);
    //                 setCurrentMuxAssetId(highlightSrc);
    //             } else {
    //                 setHighlight(false);
    //                 setCurrentMuxAssetId(videoSrc);
    //             }

    //             setTimeout(() => {
    //                 updateCaptionsMode(settings.captionMode);
    //             }, 100);
    //         }
    //     }
    // }, [videoSrc, highlightSrc]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedSettings = localStorage.getItem("ca11ySettings");

            if (!savedSettings) console.error("No ca11ySettings stored.")

            if (savedSettings) {
                const settings: VideoPlayerSettings = JSON.parse(savedSettings);
                setCaptionMode(settings.captionMode);
                setPlaybackRate(settings.playbackRate);
                setManualPlaybackRate(settings.manualPlaybackRate);
                setIsSpeedAutomated(settings.isSpeedAutomated);
                setSpeakerControl(settings.speakerControl);
                setMusicControl(settings.musicControl);
                setOtherControl(settings.otherControl);

                if (settings.highlight) {
                    setHighlight(true);
                    setCurrentMuxAssetId(highlightSrc);
                } else {
                    setHighlight(false);
                    setCurrentMuxAssetId(videoSrc);
                }

                setTimeout(() => {
                    updateCaptionsMode(settings.captionMode);
                }, 100);
            }
        }
    }, [videoSrc, highlightSrc]);

    const saveSettings = useCallback(() => {
        if (typeof window !== "undefined") {
            const settings: VideoPlayerSettings = {
                captionMode,
                playbackRate,
                manualPlaybackRate,
                isSpeedAutomated,
                highlight,
                speakerControl,
                musicControl,
                otherControl
            };
            localStorage.setItem("ca11ySettings", JSON.stringify(settings));
        }
    }, [captionMode, playbackRate, manualPlaybackRate, isSpeedAutomated, highlight, speakerControl, musicControl, otherControl]);

    useEffect(() => {
        if (speakerRef.current) speakerRef.current.volume = speakerControl.volume;
        if (musicRef.current) musicRef.current.volume = musicControl.volume;
        if (otherRef.current) otherRef.current.volume = otherControl.volume;
    }, [speakerControl.volume, musicControl.volume, otherControl.volume]);

    const handleCaptions = (): void => {
        const newMode = captionMode === "none" ? "default" : "none";
        updateCaptionsMode(newMode);
        setCaptionMode(newMode);
        handleLogging(`Captions turned ${newMode === "none" ? "off" : "on"}.`, "captions");
        setTimeout(saveSettings, 0);
    };

    const handleSimpleCaptions = (): void => {
        let newMode: "none" | "default" | "simplified";
        if (captionMode === "default") {
            newMode = "simplified";
        } else if (captionMode === "simplified") {
            newMode = "default";
        } else {
            newMode = "simplified";
        }
        updateCaptionsMode(newMode);
        setCaptionMode(newMode);
        handleLogging(`Caption mode changed to ${newMode}.`, "captions");
        setTimeout(saveSettings, 0);
    };

    // const handleHighlight = (): void => {
    //     if (isMuxPlayerLoaded) setShowVideo(false);

    //     setTimeout(() => {
    //         setHighlight(prev => {
    //             const newValue = !prev;
    //             if (newValue) {
    //                 setCurrentMuxAssetId(muxAssetId?.highlight);
    //                 handleLogging("Highlight was turned on.", "highlight");
    //             } else {
    //                 setCurrentMuxAssetId(muxAssetId?.original);
    //                 handleLogging("Highlight was turned off.", "highlight");
    //             }

    //             setTimeout(saveSettings, 0);
    //             if (isMuxPlayerLoaded) setShowVideo(true);

    //             return newValue;
    //         });
    //     }, 0);
    // };

    const handleHighlight = (): void => {
        if (isMuxPlayerLoaded) setShowVideo(false);

        setTimeout(() => {
            setHighlight(prev => {
                const newValue = !prev;
                if (newValue) {
                    setCurrentMuxAssetId(muxAssetId?.highlight);
                    handleLogging("Highlight was turned on.", "highlight");
                } else {
                    setCurrentMuxAssetId(muxAssetId?.original);
                    handleLogging("Highlight was turned off.", "highlight");
                }
                
                setTimeout(saveSettings, 0);
                if (isMuxPlayerLoaded) setShowVideo(true);

                return newValue;
            });
        }, 0);
    };

    useEffect(() => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (player && speaker && music && other) {
            player.pause();
            speaker.pause();
            music.pause();
            other.pause();

            player.currentTime = currentTimestamp;
            player.playbackRate = playbackRate;
            speaker.currentTime = currentTimestamp;
            music.currentTime = currentTimestamp;
            other.currentTime = currentTimestamp;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlight]);

    // const handleSlowDown = (): void => {
    //     if (isSpeedAutomated) return;
    //     if (playbackRate > 0.5) {
    //         const newRate: number = playbackRate - 0.05;
    //         setPlaybackRate(newRate);
    //         setManualPlaybackRate(newRate);
    //         handleLogging(`Playback speed was decreased to ${newRate}.`, "speed");
    //         setTimeout(saveSettings, 0);
    //     }
    // };

    const handleSlowDown = (): void => {
        if (isSpeedAutomated) return;
        if (playbackRate > 0.5) {
            const newRate: number = Math.round((playbackRate - 0.05) * 100) / 100;
            setPlaybackRate(newRate);
            setManualPlaybackRate(newRate);
            handleLogging(`Playback speed was decreased to ${newRate}.`, "speed");
            setTimeout(saveSettings, 0);
        }
    };

    // const handleSpeedUp = (): void => {
    //     if (isSpeedAutomated) return;
    //     if (playbackRate < 1.5) {
    //         const newRate: number = playbackRate + 0.05;
    //         setPlaybackRate(newRate);
    //         setManualPlaybackRate(newRate);
    //         handleLogging(`Playback speed was increased to ${newRate}.`, "speed");
    //         setTimeout(saveSettings, 0);
    //     }
    // };

    const handleSpeedUp = (): void => {
        if (isSpeedAutomated) return;
        if (playbackRate < 1.5) {
            const newRate: number = Math.round((playbackRate + 0.05) * 100) / 100;
            setPlaybackRate(newRate);
            setManualPlaybackRate(newRate);
            handleLogging(`Playback speed was increased to ${newRate}.`, "speed");
            setTimeout(saveSettings, 0);
        }
    };

    useEffect(() => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        if(player && speaker) console.log("player - speaker:", (player.currentTime - speaker.currentTime).toFixed(2), player.currentTime.toFixed(2), speaker.currentTime.toFixed(2));
    })

    const handleToggleAutomateSpeed = (): void => {
        setIsSpeedAutomated(prev => {
            const newValue = !prev;
            if (!newValue) {
                setPlaybackRate(manualPlaybackRate);
                handleLogging("Automated speed was turned off.", "speed");
            } else {
                setManualPlaybackRate(playbackRate);
                updateAutomatedSpeed(currentTimestamp);
                handleLogging("Automated speed was turned on.", "speed");
            }

            setTimeout(saveSettings, 0);

            return newValue;
        });
    };

    const updateAutomatedSpeed = useCallback((timestamp: number): void => {
        if (!metadata?.subtitles || !isSpeedAutomated) return;

        const currentSubtitle = metadata.subtitles.find(
            subtitle => timestamp >= subtitle.start_time && timestamp <= subtitle.end_time
        );

        if (currentSubtitle) {
            setPlaybackRate(currentSubtitle.complexity_score);
        } else {
            setPlaybackRate(1);
        }
    }, [metadata, isSpeedAutomated]);

    useEffect(() => {
        if (typeof window !== "undefined" && metadata) {
            saveSettings();
        }
    }, [playbackRate, saveSettings, metadata]);

    const handlePlayPause = async (button: "play" | "pause"): Promise<void> => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (player && speaker && music && other) {
            if (button === "play") {
                const targetTime = speaker.currentTime;
        
                // Set all to same time
                player.currentTime = targetTime;
                speaker.currentTime = targetTime;
                music.currentTime = targetTime;
                other.currentTime = targetTime;
                setCurrentTimestamp(targetTime);

                // Wait for seeks to complete
                await Promise.all([
                    new Promise<void>(resolve => {
                        const checkReady = () => {
                            if (Math.abs(player.currentTime - targetTime) < 0.1) resolve();
                            else requestAnimationFrame(checkReady);
                        };
                        checkReady();
                    }),
                    new Promise<void>(resolve => {
                        const checkReady = () => {
                            if (Math.abs(speaker.currentTime - targetTime) < 0.1) resolve();
                            else requestAnimationFrame(checkReady);
                        };
                        checkReady();
                    }),
                    new Promise<void>(resolve => {
                        const checkReady = () => {
                            if (Math.abs(music.currentTime - targetTime) < 0.1) resolve();
                            else requestAnimationFrame(checkReady);
                        };
                        checkReady();
                    }),
                    new Promise<void>(resolve => {
                        const checkReady = () => {
                            if (Math.abs(other.currentTime - targetTime) < 0.1) resolve();
                            else requestAnimationFrame(checkReady);
                        };
                        checkReady();
                    }),
                ]);

                try {
                    // Now play all at once
                    await Promise.all([
                        player.play(),
                        speaker.play(),
                        music.play(),
                        other.play()
                    ]);
                    
                    // setCurrentTimestamp(player.currentTime);
                    handleLogging("Video was put in play.");
                } catch (error) {
                    console.error("Error starting playback:", error);
                }
            } else {
                player.pause();
                speaker.pause();
                music.pause();
                other.pause();
                setCurrentTimestamp(player.currentTime);
                handleLogging("Video playback paused.");
                // player.currentTime = time;
                speaker.currentTime = player.currentTime;
                music.currentTime = player.currentTime;
                other.currentTime = player.currentTime;
            }
        }
    };

    // const handleSeek = (value: number) => {
    //     const player = muxPlayerRef.current;
    //     const speaker = speakerRef.current;
    //     const music = musicRef.current;
    //     const other = otherRef.current;
    //     const time = value;

    //     if (player && speaker && music && other) {
    //         player.currentTime = time;
    //         speaker.currentTime = time;
    //         music.currentTime = time;
    //         other.currentTime = time;
    //         setCurrentTimestamp(time);
    //         handleLogging(`The video was seeked to ${formatTime(time)}.`)

    //         if (isSpeedAutomated) {
    //             updateAutomatedSpeed(time);
    //         }
    //     }
    // };

    const handleSeek = async (value: number): Promise<void> => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;
        const time = value;

        if (player && speaker && music && other) {
            // Pause everything first
            player.pause();
            speaker.pause();
            music.pause();
            other.pause();

            // Set time on all elements
            player.currentTime = time;
            speaker.currentTime = time;
            music.currentTime = time;
            other.currentTime = time;
            setCurrentTimestamp(time);

            // Wait for seek operations to complete
            await new Promise(resolve => {
                let readyCount = 0;
                const checkReady = () => {
                    readyCount++;
                    if (readyCount === 4) {
                        resolve(void 0);
                    }
                };

                player.addEventListener('seeked', checkReady, { once: true });
                speaker.addEventListener('seeked', checkReady, { once: true });
                music.addEventListener('seeked', checkReady, { once: true });
                other.addEventListener('seeked', checkReady, { once: true });

                // Fallback timeout
                setTimeout(() => resolve(void 0), 100);
            });

            handleLogging(`The video was seeked to ${formatTime(time)}.`);

            if (isSpeedAutomated) {
                updateAutomatedSpeed(time);
            }
        }
    };

    const handleSpeakerVolume = (val: number) => {
        setSpeakerControl((prev: AudioControls) => {
            const updated = { ...prev, volume: val, muted: false, prevVolume: val };
            handleLogging(`Speaker volume was set to ${val}.`, "volume");
            setTimeout(saveSettings, 0);
            return updated;
        });
    };

    const handleMusicVolume = (val: number) => {
        setMusicControl((prev: AudioControls) => {
            const updated = { ...prev, volume: val, muted: false, prevVolume: val };
            handleLogging(`Music volume was set to ${val}.`, "volume");
            setTimeout(saveSettings, 0);
            return updated;
        });
    };

    const handleOtherVolume = (val: number) => {
        setOtherControl((prev: AudioControls) => {
            const updated = { ...prev, volume: val, muted: false, prevVolume: val };
            handleLogging(`Other volume was set to ${val}.`, "volume");
            setTimeout(saveSettings, 0);
            return updated;
        });
    };

    const handleSpeakerMute = (): void => {
        setSpeakerControl((prev: AudioControls) => {
            const updated = prev.muted
                ? { ...prev, muted: false, volume: prev.prevVolume }
                : { ...prev, muted: true, prevVolume: prev.volume, volume: 0 };
            handleLogging(`Speaker audio ${prev.muted ? "unmuted" : "muted"}`, "volume");
            setTimeout(saveSettings, 0);
            return updated;
        });
    };

    const handleMusicMute = (): void => {
        setMusicControl((prev: AudioControls) => {
            const updated = prev.muted
                ? { ...prev, muted: false, volume: prev.prevVolume }
                : { ...prev, muted: true, prevVolume: prev.volume, volume: 0 };
            handleLogging(`Music audio ${prev.muted ? "unmuted" : "muted"}`, "volume");
            setTimeout(saveSettings, 0);
            return updated;
        });
    };

    const handleOtherMute = (): void => {
        setOtherControl((prev: AudioControls) => {
            const updated = prev.muted
                ? { ...prev, muted: false, volume: prev.prevVolume }
                : { ...prev, muted: true, prevVolume: prev.volume, volume: 0 };
            handleLogging(`Other audio ${prev.muted ? "unmuted" : "muted"}`, "volume");
            setTimeout(saveSettings, 0);
            return updated;
        });
    };

    const handleSkipForwards = (): void => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (player && speaker && music && other && metadata) {
            const currentTime = player.currentTime;
            const newTime = currentTime + 10 > metadata.duration ? metadata.duration : currentTime + 10;
            player.currentTime = newTime;
            speaker.currentTime = newTime;
            music.currentTime = newTime;
            other.currentTime = newTime;
            handleLogging(`Skipped forward 10 seconds from ${formatTime(currentTime)} to ${formatTime(newTime)}.`);

            setCurrentTimestamp(newTime);

            if (isSpeedAutomated) {
                updateAutomatedSpeed(newTime);
            }
        }
    };

    const handleSkipBackwards = (): void => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (player && speaker && music && other) {
            const currentTime = player.currentTime;
            const newTime = currentTime - 10 <= 0 ? 0 : currentTime - 10;
            player.currentTime = newTime;
            speaker.currentTime = newTime;
            music.currentTime = newTime;
            other.currentTime = newTime;
            handleLogging(`Skipped backwards 10 seconds from ${formatTime(currentTime)} to ${formatTime(newTime)}.`);

            setCurrentTimestamp(newTime);

            if (isSpeedAutomated) {
                updateAutomatedSpeed(newTime);
            }
        }
    };

    const videoStateRef = useRef<{ time: number, shouldPlay: boolean } | null>(null);

    const toggleFullscreen = (): void => {
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
                const currentTime = currentTimestamp;
                const isPlaying = !!(speakerRef.current && !speakerRef.current.paused);

                const fullscreenStateRef = {
                    time: currentTime,
                    shouldPlay: isPlaying
                };

                videoStateRef.current = fullscreenStateRef;
                setIsMuxPlayerLoaded(true);

                if (videoContainerRef.current.requestFullscreen) {
                    videoContainerRef.current.requestFullscreen();
                    handleLogging("Entered fullscreen mode.", lastAction);
                } else if (videoContainerRef.current.webkitRequestFullscreen) {
                    videoContainerRef.current.webkitRequestFullscreen();
                    handleLogging("Entered fullscreen mode.", lastAction);
                } else if (videoContainerRef.current.msRequestFullscreen) {
                    videoContainerRef.current.msRequestFullscreen();
                    handleLogging("Entered fullscreen mode.", lastAction);
                }
            } else {
                if (document.exitFullscreen) {
                    handlePlayPause("pause");
                    document.exitFullscreen();
                    handleLogging("Exited fullscreen mode.", lastAction);
                }
            }
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const handleFullScreenChange = (): void => {
            const isNowFullScreen = !!document.fullscreenElement;
            setIsFullScreen(isNowFullScreen);

            if (!isNowFullScreen && isFullScreen) {
                setIsMuxPlayerLoaded(false);
                const question = getEMAQuestion(lastAction);
                setEma({
                    isOpen: true,
                    currentQuestion: question,
                    lastAction: lastAction
                });
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, [isFullScreen, lastAction]);

    // useEffect(() => {
    //     const player = muxPlayerRef.current;
    //     const speaker = speakerRef.current;
    //     const music = musicRef.current;
    //     const other = otherRef.current;

    //     if (player && speaker && music && other) {
    //         const checkTime = (): void => {
    //             if (speaker.currentTime !== currentTimestamp) {
    //                 setCurrentTimestamp(speaker.currentTime);

    //                 if (isSpeedAutomated) {
    //                     updateAutomatedSpeed(speaker.currentTime);
    //                 }
    //             }
    //         };

    //         const interval = setInterval(checkTime, 100);

    //         return () => {
    //             clearInterval(interval);
    //         };
    //     }
    // }, [currentTimestamp, isSpeedAutomated, metadata, updateAutomatedSpeed]);

    useEffect(() => {
        const speaker = speakerRef.current;
        if (speaker) {
            const handleTimeUpdate = () => {
                setCurrentTimestamp(speaker.currentTime);
                if (isSpeedAutomated) {
                    updateAutomatedSpeed(speaker.currentTime);
                }
            };

            speaker.addEventListener('timeupdate', handleTimeUpdate);
            return () => speaker.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [isSpeedAutomated, updateAutomatedSpeed]);

    // useEffect(() => {
    //     const player = muxPlayerRef.current;
    //     const speaker = speakerRef.current;
    //     const music = musicRef.current;
    //     const other = otherRef.current;
    
    //     // Only run this interval when NOT in fullscreen mode
    //     // When in fullscreen, let MuxPlayer's onTimeUpdate handle the timing
    //     if (player && speaker && music && other && !isFullScreen) {
    //         const checkTime = (): void => {
    //             if (speaker.currentTime !== currentTimestamp) {
    //                 setCurrentTimestamp(speaker.currentTime);
    
    //                 if (isSpeedAutomated) {
    //                     updateAutomatedSpeed(speaker.currentTime);
    //                 }
    //             }
    //         };
    
    //         const interval = setInterval(checkTime, 100);
    
    //         return () => {
    //             clearInterval(interval);
    //         };
    //     }
    // }, [currentTimestamp, isSpeedAutomated, metadata, updateAutomatedSpeed, isFullScreen]);

    useEffect(() => {
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (speaker && music && other) {
            speaker.playbackRate = playbackRate;
            music.playbackRate = playbackRate;
            other.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    // I am not sure if this works now with the MuxPlayer only being rendered when in fullscreen mode
    // This normally ensures that the video and audio are synced
    // If the MuxPlayer is created when entering fullscreen mode, it resets the video
    // And the sync does not work here since the video element does not exist until then
    useEffect(() => {
        const player = muxPlayerRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (!speaker || !music || !other) {
            return;
        }

        const videoElement = player?.shadowRoot?.querySelector('video') || player?.querySelector('video');
        if (!videoElement) return;

        const syncAudio = (): void => {
            if (videoElement.paused) {
                speaker.pause();
                music.pause();
                other.pause();
            } else {
                speaker.play().catch((e) => console.error("Speaker play failed:", e));
                music.play().catch((e) => console.error("Music play failed:", e));
                other.play().catch((e) => console.error("Other play failed:", e));
            }
        };

        videoElement.addEventListener("play", syncAudio);
        videoElement.addEventListener("pause", syncAudio);

        return () => {
            videoElement.removeEventListener("play", syncAudio);
            videoElement.removeEventListener("pause", syncAudio);
        };
    });

    return (
        <div className="w-full mx-auto relative">
            <div className="absolute w-px h-px overflow-hidden -left-px -top-px">
                <audio id="speaker" ref={speakerRef} src={speakerSrc} preload="auto" />
                <audio id="music" ref={musicRef} src={musicSrc} preload="auto" />
                <audio id="other" ref={otherRef} src={otherSrc} preload="auto" />
            </div>
            {error && <p className="text-red-500 text-center p-2">Error: {error}</p>}
            {loading ? (
                <p className="text-center p-4">Loading video player...</p>
            ) : !metadata ? (
                <p className="text-center p-4">Video metadata not available.</p>
            ) : (
                <>
                    {!isFullScreen && (
                        <div className="p-4 md:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CaptionControls
                                    captionMode={captionMode}
                                    onCaptionsToggle={handleCaptions}
                                    onSimpleCaptions={handleSimpleCaptions}
                                    onOpenHelp={() => { handleOpenHelp("captions") }}
                                />
                                <SpotlightControls highlight={highlight} onHighlightToggle={handleHighlight} onOpenHelp={handleOpenHelp} />
                                <PlaybackSpeedControls
                                    playbackRate={playbackRate}
                                    isSpeedAutomated={isSpeedAutomated}
                                    onSlowDown={handleSlowDown}
                                    onSpeedUp={handleSpeedUp}
                                    onToggleAutomateSpeed={handleToggleAutomateSpeed}
                                    onOpenHelp={handleOpenHelp}
                                />
                                <VolumeControls
                                    speakerControl={speakerControl}
                                    musicControl={musicControl}
                                    otherControl={otherControl}
                                    onSpeakerVolumeChange={handleSpeakerVolume}
                                    onMusicVolumeChange={handleMusicVolume}
                                    onOtherVolumeChange={handleOtherVolume}
                                    onSpeakerMute={handleSpeakerMute}
                                    onMusicMute={handleMusicMute}
                                    onOtherMute={handleOtherMute}
                                    onOpenHelp={() => handleOpenHelp("volume")}
                                />
                            </div>
                            <div className="my-4">
                                <IconButton
                                    text="Play Video"
                                    icon="play"
                                    onClickFunction={toggleFullscreen}
                                    className="w-full justify-center text-lg py-8"
                                    aria-label="Enter fullscreen video mode"
                                />
                            </div>
                        </div>
                    )}
                    <div ref={videoContainerRef} className={`bg-black ${isFullScreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'hidden'}`}>
                        {showVideo && isFullScreen && isMuxPlayerLoaded && (
                            <MuxPlayer
                                ref={muxPlayerRef}
                                playbackId={currentMuxAssetId}
                                streamType="on-demand"
                                muted={true}
                                autoPlay={false}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                playbackRate={playbackRate}
                                startTime={currentTimestamp}
                                // startTime={speakerRef.current?.currentTime}
                            >
                                <track
                                    label={`English ${captionMode}`}
                                    kind="subtitles"
                                    srcLang="en"
                                    src={captionMode === "none" ? "" : captionMode === "default" ? defaultCaptionsSrc : simplifiedCaptionsSrc}
                                />
                            </MuxPlayer>
                        )}
                        {isFullScreen && (
                            <FullscreenControls
                                isUserActive={isUserActive}
                                currentTimestamp={currentTimestamp}
                                duration={metadata!.duration}
                                onSkipBackwards={handleSkipBackwards}
                                onSkipForwards={handleSkipForwards}
                                onPlayPause={handlePlayPause}
                                onSeek={handleSeek}
                                onExitFullscreen={toggleFullscreen}
                            />
                        )}
                    </div>
                    {ema.currentQuestion && (
                        <EMACard
                            isOpen={ema.isOpen}
                            onClose={handleEMAClose}
                            question={ema.currentQuestion}
                            userName={userName}
                        />
                    )}
                </>
            )}
            <HelpPopup
                isOpen={helpPopup.isOpen}
                onClose={handleCloseHelp}
                title={helpPopup.title}
                content={helpPopup.content}
            />
        </div>
    );
};

export default VideoPlayer;
