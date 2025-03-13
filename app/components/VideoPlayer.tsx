"use client";

import { useEffect, useState, useRef } from "react";
import Video from "next-video";
import { Slider } from "@heroui/slider";

interface VideoMetadata {
    duration: number;
}

interface VideoPlayerProps {
    videoName: string;
}

interface AudioControls {
    volume: number;
    muted: boolean;
    prevVolume: number;
}

const VideoPlayer = ({ videoName }: VideoPlayerProps): JSX.Element => {
    const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const basePath = `/${videoName}/${videoName}`;
    const videoSrc = `${basePath}.mp4`;
    const highlightSrc = `${basePath}_highlight.mp4`;
    const speakerSrc = `${basePath}_speaker.mp3`;
    const musicSrc = `${basePath}_music.mp3`;
    const otherSrc = `${basePath}_other.mp3`;
    const defaultCaptionsSrc = `${basePath}.vtt`;
    const simplifiedCaptionsSrc = `${basePath}_simplified.vtt`;
    const buttonClass = "py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500";

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

    const updateCaptionsMode = (mode: "none" | "default" | "simplified") => {
        const video = videoRef.current;
        if (!video) return;
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

    useEffect(() => {
        if (speakerRef.current) speakerRef.current.volume = speakerControl.volume;
        if (musicRef.current) musicRef.current.volume = musicControl.volume;
        if (otherRef.current) otherRef.current.volume = otherControl.volume;
    }, [speakerControl.volume, musicControl.volume, otherControl.volume]);

    const handleCaptions = (): void => {
        updateCaptionsMode(captionMode === "none" ? "default" : "none");
    }

    const handleSimpleCaptions = (): void => {
        if (captionMode === "default") {
            updateCaptionsMode("simplified");
        } else if (captionMode === "simplified") {
            updateCaptionsMode("default");
        } else {
            // If captions are off, turn on simplified captions.
            updateCaptionsMode("simplified");
        }
    };


    const handleHighlight = (): void => {
        setShowVideo(false);
        setTimeout(() => {
            setHighlight(prev => !prev);
            if (highlight) {
                setVideoSource(videoSrc);
            } else {
                setVideoSource(highlightSrc);
            }
            setShowVideo(true);
        }, 0);
    }

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
        if (playbackRate > 0.2) setPlaybackRate((prev) => prev - 0.1);
    };

    const handleSpeedUp = (): void => {
        if (playbackRate < 2) setPlaybackRate((prev) => prev + 0.1);
    };

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
            } else {
                video.pause();
                speaker.pause();
                music.pause();
                other.pause();
                setCurrentTimestamp(video.currentTime);
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
        }
    };

    // const handleSpeakerVolume = (val: number) => {
    //     setMuteSpeaker({ mute: false, prevVolume: val })
    //     setSpeakerVolume(val);
    // }

    // const handleMusicVolume = (val: number) => {
    //     setMuteMusic({ mute: false, prevVolume: val })
    //     setMusicVolume(val);
    // }

    // const handleOtherVolume = (val: number) => {
    //     setMuteOther({ mute: false, prevVolume: val })
    //     setOtherVolume(val);
    // }

    const handleSpeakerVolume = (val: number) => {
        setSpeakerControl((prev: AudioControls) => ({ ...prev, volume: val, muted: false, prevVolume: val }));
    };

    const handleMusicVolume = (val: number) => {
        setMusicControl((prev: AudioControls) => ({ ...prev, volume: val, muted: false, prevVolume: val }));
    };

    const handleOtherVolume = (val: number) => {
        setOtherControl((prev: AudioControls) => ({ ...prev, volume: val, muted: false, prevVolume: val }));
    };

    // const handleSpeakerMute = (): void => {
    //     if (muteSpeaker.mute === true) {
    //         setSpeakerVolume(muteSpeaker.prevVolume)
    //         setMuteSpeaker({ mute: false, prevVolume: muteSpeaker.prevVolume });
    //     } else {
    //         setMuteSpeaker({ mute: true, prevVolume: speakerVolume });
    //         setSpeakerVolume(0);
    //     }
    // }

    // const handleMusicMute = (): void => {
    //     if (muteMusic.mute === true) {
    //         setMusicVolume(muteMusic.prevVolume)
    //         setMuteMusic({ mute: false, prevVolume: muteMusic.prevVolume });
    //     } else {
    //         setMuteMusic({ mute: true, prevVolume: musicVolume });
    //         setMusicVolume(0);
    //     }
    // }

    // const handleOtherMute = (): void => {
    //     if (muteOther.mute === true) {
    //         setOtherVolume(muteOther.prevVolume)
    //         setMuteOther({ mute: false, prevVolume: muteOther.prevVolume });
    //     } else {
    //         setMuteOther({ mute: true, prevVolume: otherVolume });
    //         setOtherVolume(0);
    //     }
    // }

    const handleSpeakerMute = (): void => {
        setSpeakerControl((prev: AudioControls) =>
            prev.muted
                ? { ...prev, muted: false, volume: prev.prevVolume }
                : { ...prev, muted: true, prevVolume: prev.volume, volume: 0 }
        );
    };

    const handleMusicMute = (): void => {
        setMusicControl((prev: AudioControls) =>
            prev.muted
                ? { ...prev, muted: false, volume: prev.prevVolume }
                : { ...prev, muted: true, prevVolume: prev.volume, volume: 0 }
        );
    };

    const handleOtherMute = (): void => {
        setOtherControl((prev: AudioControls) =>
            prev.muted
                ? { ...prev, muted: false, volume: prev.prevVolume }
                : { ...prev, muted: true, prevVolume: prev.volume, volume: 0 }
        );
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
        }
    };

    const toggleFullscreen = (): void => {
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
                if (videoContainerRef.current.requestFullscreen) {
                    videoContainerRef.current.requestFullscreen();
                } else if (videoContainerRef.current.webkitRequestFullscreen) {
                    videoContainerRef.current.webkitRequestFullscreen();
                } else if (videoContainerRef.current.msRequestFullscreen) {
                    videoContainerRef.current.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
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
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && speaker && music && other) {
            const checkTime = (): void => {
                if (video.currentTime !== currentTimestamp) {
                    setCurrentTimestamp(video.currentTime);
                }
            };

            const interval = setInterval(checkTime, 100);

            return () => {
                clearInterval(interval);
            };
        }
    }, [currentTimestamp]);

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

    // useEffect(() => {
    //     if (speakerRef.current) speakerRef.current.volume = speakerVolume;
    //     if (musicRef.current) musicRef.current.volume = musicVolume;
    //     if (otherRef.current) otherRef.current.volume = otherVolume;
    // }, [speakerVolume, musicVolume, otherVolume]);

    useEffect(() => {
        const video = videoRef.current;
        const speaker = speakerRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (!video || !speaker || !music || !other) return;

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
        <div className="m-auto text-center">
            {error && <p>Error: {error}</p>}
            {loading ? (
                <p>Loading metadata...</p>
            ) : (
                <>
                    <div className="w-3/5 mx-auto" ref={videoContainerRef}>
                        {showVideo && (
                            <Video id="video" ref={videoRef} controls={false} muted>
                                <source id="videoSource" src={videoSource} type="video/mp4" />
                                <track label="Default English" kind="subtitles" srcLang="en" src={defaultCaptionsSrc} />
                                <track label="Simplified English" kind="subtitles" srcLang="en" src={simplifiedCaptionsSrc} />
                            </Video>
                        )}
                        <audio id="speaker" ref={speakerRef} src={speakerSrc} />
                        <audio id="music" ref={musicRef} src={musicSrc} />
                        <audio id="other" ref={otherRef} src={otherSrc} />
                        {isFullScreen && (
                            <div className="absolute top-4 right-4 z-10" style={{ pointerEvents: "none" }}>
                                <button onClick={toggleFullscreen} style={{ pointerEvents: "auto" }} className="py-2 px-4 bg-gray-800 text-white rounded">
                                    Exit Full Screen
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="w-3/5 mx-auto">
                        <Slider
                            aria-label="SeekbarSlider"
                            name="seekSlider"
                            color="success"
                            size="lg"
                            classNames={{ track: "custom-slider-track" }}
                            defaultValue={currentTimestamp}
                            minValue={0}
                            maxValue={metadata!.duration} // HARD CODED - needs to be extracted from metadata
                            step={1}
                            value={currentTimestamp}
                            onChange={(val) => handleSeek(val as number)}
                        />
                        <p>{formatTime(currentTimestamp)} / {formatTime(metadata!.duration)}</p>
                    </div>

                    <div>
                        <button className={buttonClass} onClick={() => { handleCaptions() }}>{captionMode === "none" ? "Turn ON captions ©©" : "Turn OFF captions ❌"}</button>
                        {captionMode !== "none" && (
                            <button className={buttonClass} onClick={() => handleSimpleCaptions()}>{captionMode === "default" ? "Make Simple" : "Return Default"}</button>
                        )}
                    </div>

                    <div>
                        <button className={buttonClass} onClick={toggleFullscreen}>Toggle Fullscreen 📺</button>
                    </div>

                    <div>
                        <button className={buttonClass} onClick={() => handleSkipBackwards()}>
                            ⏪ 10s
                        </button>
                        <button className={buttonClass} onClick={() => handlePlayPause("play")}
                        >
                            Play ▶
                        </button>
                        <button className={buttonClass} onClick={() => handlePlayPause("pause")}
                        >
                            Pause ⏸
                        </button>
                        <button className={buttonClass} onClick={() => handleSkipForwards()}>
                            10s ⏩
                        </button>
                    </div>

                    <div>
                        <button className={buttonClass} onClick={() => handleHighlight()}>{highlight ? "Turn OFF spotlight ❌" : "Turn ON spotlight 💡"}</button>
                    </div>

                    <div>
                        <button className={buttonClass} onClick={handleSlowDown}>
                            Slow Down
                        </button>
                        <label className="px-2">{Math.floor(playbackRate * 100)}%</label>
                        <button className={buttonClass} onClick={handleSpeedUp}>
                            Speed Up
                        </button>
                    </div>

                    <div className="m-auto">
                        <div className="w-1/3 m-auto">
                            <label>Speaker volume - {Math.floor(speakerControl.volume * 100)}%</label>
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
                                onChange={(val) => handleSpeakerVolume(val as number)}
                                endContent={
                                    <button onClick={() => { handleSpeakerMute() }}>{speakerControl.muted ? ("🔇") : ("🔊")}</button>
                                }
                            />
                        </div>
                        <div className="w-1/3 m-auto">
                            <label>Music volume - {Math.floor(musicControl.volume * 100)}%</label>
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
                                onChange={(val) => handleMusicVolume(val as number)}
                                endContent={
                                    <button onClick={() => { handleMusicMute() }}>{musicControl.muted ? ("🔇") : ("🔊")}</button>
                                }
                            />
                        </div>
                        <div className="w-1/3 m-auto">
                            <label>Other volume - {Math.floor(otherControl.volume * 100)}%</label>
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
                                onChange={(val) => handleOtherVolume(val as number)}
                                endContent={
                                    <button onClick={() => { handleOtherMute() }}>{otherControl.muted ? ("🔇") : ("🔊")}</button>
                                }
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VideoPlayer;
