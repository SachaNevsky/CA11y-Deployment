// ./app/components/VideoPlayer.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Video from "next-video";
import { Slider } from "@heroui/slider";
import EMACard from "./EMACard";
import { AudioControls, VideoMetadata, VideoPlayerProps, VideoPlayerSettings, EMAQuestion, EMAState } from "../api/types";
import { logAction } from "@/lib/logAction";
import { EMA_QUESTIONS } from "../api/EMAQuestions";

const VideoPlayer = ({ videoName }: VideoPlayerProps): JSX.Element => {
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLeftHanded, setIsLeftHanded] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isSpeedAutomated, setIsSpeedAutomated] = useState<boolean>(false);
    const [manualPlaybackRate, setManualPlaybackRate] = useState<number>(1);

    const basePath = `/${videoName}/${videoName}`;
    const videoSrc = `${basePath}.mp4`;
    const highlightSrc = `${basePath}_highlight.mp4`;
    const speakerSrc = `${basePath}_speaker.mp3`;
    const musicSrc = `${basePath}_music.mp3`;
    const otherSrc = `${basePath}_other.mp3`;
    const defaultCaptionsSrc = `${basePath}.vtt`;
    const simplifiedCaptionsSrc = `${basePath}_simplified.vtt`;
    const buttonClass = "py-2 px-3 m-1 border-solid border-2 rounded-md border-gray-500 w-full text-base font-medium";

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const speakerRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const otherRef = useRef<HTMLAudioElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);

    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(0.1);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [highlight, setHighlight] = useState<boolean>(false);
    const [videoSource, setVideoSource] = useState<string>(videoSrc);
    const [showVideo, setShowVideo] = useState<boolean>(true);
    const [captionMode, setCaptionMode] = useState<"none" | "default" | "simplified">("none");
    const [speakerControl, setSpeakerControl] = useState<AudioControls>({ volume: 1, muted: false, prevVolume: 1 });
    const [musicControl, setMusicControl] = useState<AudioControls>({ volume: 1, muted: false, prevVolume: 1 });
    const [otherControl, setOtherControl] = useState<AudioControls>({ volume: 1, muted: false, prevVolume: 1 });

    const [ema, setEma] = useState<EMAState>({
        isOpen: false,
        currentQuestion: null,
        lastAction: "general"
    });
    const [userName, setUserName] = useState<string>("");
    const [lastAction, setLastAction] = useState<string>("general");

    const handleLogging = (action: string, category: string = "general") => {
        if (typeof window !== 'undefined') {
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
        if (typeof window !== "undefined") {
            const aphasiaCharacteristics = localStorage.getItem("ca11yAphasiaCharacteristics");

            if (aphasiaCharacteristics) {
                const handedness = JSON.parse(aphasiaCharacteristics).handedness || "rightHanded";
                setIsLeftHanded(handedness === "leftHanded");
            } else {
                console.error("No ca11yAphasiaCharacteristics stored.")
            }

            const checkIsMobile = () => {
                setIsMobile(window.innerWidth < 768);
            };

            checkIsMobile();
            window.addEventListener("resize", checkIsMobile);
            return () => window.removeEventListener("resize", checkIsMobile);
        }
    }, []);

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
                    setVideoSource(highlightSrc);
                } else {
                    setHighlight(false);
                    setVideoSource(videoSrc);
                }

                setTimeout(() => {
                    updateCaptionsMode(settings.captionMode);
                }, 100);
            } else {
                const aphasiaCharacteristics = localStorage.getItem("ca11yAphasiaCharacteristics");
                if (aphasiaCharacteristics) {
                    const handedness = JSON.parse(aphasiaCharacteristics).handedness || "rightHanded";
                    setIsLeftHanded(handedness === "leftHanded");
                } else {
                    console.error("No ca11yAphasiaCharacteristics stored.")
                }
            }

            const checkIsMobile = () => {
                setIsMobile(window.innerWidth < 768);
            };

            checkIsMobile();
            window.addEventListener("resize", checkIsMobile);
            return () => window.removeEventListener("resize", checkIsMobile);
        }
    }, [videoSrc, highlightSrc]);

    const saveSettings = useCallback(() => {
        if (typeof window !== 'undefined') {
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

    const handleHighlight = (): void => {
        setShowVideo(false);
        setTimeout(() => {
            setHighlight(prev => {
                const newValue = !prev;
                if (newValue) {
                    setVideoSource(highlightSrc);
                    handleLogging("Highlight was turned on.", "highlight")
                } else {
                    setVideoSource(videoSrc);
                    handleLogging("Highlight was turned off.", "highlight")
                }

                setTimeout(saveSettings, 0);

                return newValue;
            });
            setShowVideo(true);
        }, 0);
    };

    useEffect(() => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && speaker && music && other) {
            video.pause();
            speaker.pause();
            music.pause();
            other.pause();

            video.currentTime = currentTimestamp;
            video.playbackRate = playbackRate;
            speaker.currentTime = currentTimestamp;
            music.currentTime = currentTimestamp;
            other.currentTime = currentTimestamp;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlight]);

    const handleSlowDown = (): void => {
        if (isSpeedAutomated) return;
        if (playbackRate > 0.2) {
            const newRate = playbackRate - 0.1;
            setPlaybackRate(newRate);
            setManualPlaybackRate(newRate);
            handleLogging(`Playback speed was decreased to ${newRate}.`, "speed");
            setTimeout(saveSettings, 0);
        }
    };

    const handleSpeedUp = (): void => {
        if (isSpeedAutomated) return;
        if (playbackRate < 2) {
            const newRate = playbackRate + 0.1;
            setPlaybackRate(newRate);
            setManualPlaybackRate(newRate);
            handleLogging(`Playback speed was increased to ${newRate}.`, "speed");
            setTimeout(saveSettings, 0);
        }
    };

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

    const handlePlayPause = (button: "play" | "pause"): void => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && speaker && music && other) {
            if (button === "play") {
                video.play();
                speaker.play();
                music.play();
                other.play();
                setCurrentTimestamp(video.currentTime);
                handleLogging("Video was put in play.")
            } else {
                video.pause();
                speaker.pause();
                music.pause();
                other.pause();
                setCurrentTimestamp(video.currentTime);
                handleLogging("Video playback paused.")
            }
        }
    };

    const handleSeek = (value: number) => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;
        const time = value;

        if (video && speaker && music && other) {
            video.currentTime = time;
            speaker.currentTime = time;
            music.currentTime = time;
            other.currentTime = time;
            setCurrentTimestamp(time);
            handleLogging(`The video was seeked to ${formatTime(time)}.`)

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
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;
        if (video && speaker && music && other && metadata) {
            const currentTime = video.currentTime;
            const newTime = currentTime + 10 > metadata.duration ? metadata.duration : currentTime + 10;
            video.currentTime = newTime;
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
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;
        if (video && speaker && music && other) {
            const currentTime = video.currentTime;
            const newTime = currentTime - 10 <= 0 ? 0 : currentTime - 10;
            video.currentTime = newTime;
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

    const toggleFullscreen = (): void => {
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
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

    useEffect(() => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && speaker && music && other) {
            const checkTime = (): void => {
                if (video.currentTime !== currentTimestamp) {
                    setCurrentTimestamp(video.currentTime);

                    if (isSpeedAutomated) {
                        updateAutomatedSpeed(video.currentTime);
                    }
                }
            };

            const interval = setInterval(checkTime, 100);

            return () => {
                clearInterval(interval);
            };
        }
    }, [currentTimestamp, isSpeedAutomated, metadata, updateAutomatedSpeed]);

    useEffect(() => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && speaker && music && other) {
            video.playbackRate = playbackRate;
            speaker.playbackRate = playbackRate;
            music.playbackRate = playbackRate;
            other.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (!video || !speaker || !music || !other) {
            return;
        }

        speaker.muted = false;
        music.muted = false;
        other.muted = false;

        const syncAudio = (): void => {
            if (video.paused) {
                speaker.pause();
                music.pause();
                other.pause();
            } else {
                speaker.play().catch((e) => console.error("Speaker play failed:", e));
                music.play().catch((e) => console.error("Music play failed:", e));
                other.play().catch((e) => console.error("Other play failed:", e));
            }
        };

        video.addEventListener("play", syncAudio);
        video.addEventListener("pause", syncAudio);

        return () => {
            video.removeEventListener("play", syncAudio);
            video.removeEventListener("pause", syncAudio);
        };
    }, []);

    return (
        <div className="w-full mx-auto">
            {error && <p className="text-red-500 text-center p-2">Error: {error}</p>}
            {loading ? (
                <p className="text-center p-2">Loading metadata...</p>
            ) : (
                <>
                    <div className={`w-full flex ${isMobile ? 'flex-col' : ''} ${isLeftHanded && !isMobile ? 'flex-row-reverse' : ''}`}>
                        <div className={`${!isMobile ? (isLeftHanded ? 'px-6 py-2' : 'px-6 py-2') : ''} ${!isMobile ? 'w-1/2' : 'w-full'}`} ref={videoContainerRef}>
                            {showVideo && (
                                <div className="w-full">
                                    <Video id="video" ref={videoRef} controls={false} muted>
                                        <source id="videoSource" src={videoSource} type="video/mp4" />
                                        <track label="Default English" kind="subtitles" srcLang="en" src={defaultCaptionsSrc} />
                                        <track label="Simplified English" kind="subtitles" srcLang="en" src={simplifiedCaptionsSrc} />
                                    </Video>
                                </div>
                            )}
                            <audio id="speaker" ref={speakerRef} src={speakerSrc} />
                            <audio id="music" ref={musicRef} src={musicSrc} />
                            <audio id="other" ref={otherRef} src={otherSrc} />
                            {!isFullScreen && (
                                <>
                                    <div className="w-full mx-auto mt-2">
                                        <Slider
                                            aria-label="SeekbarSlider"
                                            name="seekSlider"
                                            color="success"
                                            size="lg"
                                            classNames={{ track: "custom-slider-track" }}
                                            defaultValue={currentTimestamp}
                                            minValue={0}
                                            maxValue={metadata!.duration}
                                            step={1}
                                            value={currentTimestamp}
                                            onChange={(val) => handleSeek(val as number)}
                                        />
                                        <p className="text-center mt-1">{formatTime(currentTimestamp)} / {formatTime(metadata!.duration)}</p>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <button
                                            className={buttonClass}
                                            onClick={toggleFullscreen}
                                        >
                                            Toggle Fullscreen 📺
                                        </button>
                                    </div>
                                </>
                            )}

                            {isFullScreen && (
                                <>
                                    <div className="absolute top-4 right-4 z-10" style={{ pointerEvents: "none" }}>
                                        <button onClick={toggleFullscreen} style={{ pointerEvents: "auto" }} className="py-2 px-4 bg-gray-800 text-white rounded">
                                            Exit Full Screen
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <div className="bg-black/50 rounded-lg p-4">
                                            <div className="grid grid-cols-4 gap-1 mb-2 text-white ">
                                                <button className={buttonClass} onClick={() => handleSkipBackwards()}>
                                                    ⏪ 10s
                                                </button>
                                                <button className={buttonClass} onClick={() => handlePlayPause("play")}>
                                                    Play ▶
                                                </button>
                                                <button className={buttonClass} onClick={() => handlePlayPause("pause")}>
                                                    Pause ⏸
                                                </button>
                                                <button className={buttonClass} onClick={() => handleSkipForwards()}>
                                                    10s ⏩
                                                </button>
                                            </div>
                                            <div className="w-full">
                                                <Slider
                                                    aria-label="SeekbarSlider"
                                                    name="seekSlider"
                                                    color="success"
                                                    size="lg"
                                                    classNames={{ track: "custom-slider-track" }}
                                                    defaultValue={currentTimestamp}
                                                    minValue={0}
                                                    maxValue={metadata!.duration}
                                                    step={1}
                                                    value={currentTimestamp}
                                                    onChange={(val) => handleSeek(val as number)}
                                                />
                                                <p className="text-center mt-1 text-white">{formatTime(currentTimestamp)} / {formatTime(metadata!.duration)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={`${!isMobile ? 'w-1/2 px-6' : 'w-full mt-2'}`}>
                            <div className="flex flex-col space-y-2">
                                {/* To remove */}
                                <div className="bg-gray-100 p-2 rounded-md">
                                    <h3 className="font-medium text-base mb-1">Playback</h3>
                                    <div className="grid grid-cols-4 gap-1">
                                        <button className={buttonClass} onClick={() => handleSkipBackwards()}>
                                            ⏪ 10s
                                        </button>

                                        <button className={buttonClass} onClick={() => handlePlayPause("play")}>
                                            Play ▶
                                        </button>

                                        <button className={buttonClass} onClick={() => handlePlayPause("pause")}>
                                            Pause ⏸
                                        </button>
                                        <button className={buttonClass} onClick={() => handleSkipForwards()}>
                                            10s ⏩
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-2 rounded-md">
                                    <h3 className="font-medium text-base mb-1">Captions</h3>
                                    <div className="flex flex-row justify-between gap-2">
                                        <button
                                            className={buttonClass}
                                            onClick={() => { handleCaptions() }}
                                        >
                                            {captionMode === "none" ? "Turn ON captions ©©" : "Turn OFF captions ❌"}
                                        </button>
                                        {captionMode !== "none" && (
                                            <button
                                                className={buttonClass}
                                                onClick={() => handleSimpleCaptions()}
                                            >
                                                {captionMode === "default" ? "Make Simple" : "Return Default"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-2 rounded-md">
                                    <h3 className="font-medium text-base mb-1">Spotlight</h3>
                                    <button
                                        className={buttonClass}
                                        onClick={() => handleHighlight()}
                                    >
                                        {highlight ? "Turn OFF spotlight ❌" : "Turn ON spotlight 💡"}
                                    </button>
                                </div>

                                <div className="bg-gray-100 p-2 rounded-md">
                                    <h3 className="font-medium text-base mb-1">Playback Speed</h3>
                                    <div className="grid grid-cols-2 gap-1 mb-1">
                                        {isSpeedAutomated ? (
                                            <button className={buttonClass + " text-gray-500 cursor-not-allowed"}>
                                                Slow Down
                                            </button>
                                        ) : (
                                            <button className={buttonClass} onClick={handleSlowDown}>
                                                Slow Down
                                            </button>
                                        )}
                                        {isSpeedAutomated ? (
                                            <button className={buttonClass + " text-gray-500 cursor-not-allowed"}>
                                                Speed Up
                                            </button>
                                        ) : (
                                            <button className={buttonClass} onClick={handleSpeedUp}>
                                                Speed Up
                                            </button>
                                        )}
                                    </div>
                                    <button className={buttonClass} onClick={handleToggleAutomateSpeed}>
                                        {isSpeedAutomated ? "Automated Speed ✅" : "Automated Speed ❎"}
                                    </button>
                                </div>

                                <div className="bg-gray-100 p-2 rounded-md">
                                    <h3 className="font-medium text-base mb-1">Volume Controls</h3>
                                    <div className="mb-2">
                                        <label className="block mb-1">Speaker - {Math.floor(speakerControl.volume * 100)}%</label>
                                        <div className="flex items-center">
                                            <div className="flex-grow">
                                                <Slider
                                                    aria-label="SpeakerVolumeSlider"
                                                    name="speakerSlider"
                                                    size="lg"
                                                    classNames={{ track: "custom-slider-track" }}
                                                    color={speakerControl.muted ? "secondary" : "primary"}
                                                    defaultValue={speakerControl.volume}
                                                    minValue={0}
                                                    maxValue={1}
                                                    step={0.05}
                                                    value={speakerControl.volume}
                                                    onChange={(val) => handleSpeakerVolume(val as number)}
                                                />
                                            </div>
                                            <button
                                                className="ml-2 p-1 border rounded-md"
                                                onClick={() => { handleSpeakerMute() }}
                                            >
                                                {speakerControl.muted ? ("🔇") : ("🔊")}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <label className="block mb-1">Music - {Math.floor(musicControl.volume * 100)}%</label>
                                        <div className="flex items-center">
                                            <div className="flex-grow">
                                                <Slider
                                                    aria-label="MusicVolumeSlider"
                                                    name="musicSlider"
                                                    size="lg"
                                                    classNames={{ track: "custom-slider-track" }}
                                                    color={musicControl.muted ? "secondary" : "primary"}
                                                    defaultValue={musicControl.volume}
                                                    minValue={0}
                                                    maxValue={1}
                                                    step={0.05}
                                                    value={musicControl.volume}
                                                    onChange={(val) => handleMusicVolume(val as number)}
                                                />
                                            </div>
                                            <button
                                                className="ml-2 p-1 border rounded-md"
                                                onClick={() => { handleMusicMute() }}
                                            >
                                                {musicControl.muted ? ("🔇") : ("🔊")}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-1">Other - {Math.floor(otherControl.volume * 100)}%</label>
                                        <div className="flex items-center">
                                            <div className="flex-grow">
                                                <Slider
                                                    aria-label="OtherVolumeSlider"
                                                    name="otherSlider"
                                                    size="lg"
                                                    classNames={{ track: "custom-slider-track" }}
                                                    color={otherControl.muted ? "secondary" : "primary"}
                                                    defaultValue={otherControl.volume}
                                                    minValue={0}
                                                    maxValue={1}
                                                    step={0.05}
                                                    value={otherControl.volume}
                                                    onChange={(val) => handleOtherVolume(val as number)}
                                                />
                                            </div>
                                            <button
                                                className="ml-2 p-1 border rounded-md"
                                                onClick={() => { handleOtherMute() }}
                                            >
                                                {otherControl.muted ? ("🔇") : ("🔊")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
        </div>
    );
};

export default VideoPlayer;
