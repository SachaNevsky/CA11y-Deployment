"use client";

import Video from "next-video";
import { useEffect, useState, useRef } from "react";
import { Slider } from "@heroui/slider";

const TheSocialNetwork = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const voiceRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const otherRef = useRef<HTMLAudioElement | null>(null);
    const videoContainerRef = useRef<HTMLDivElement | null>(null);

    const duration = 78; // needs to be extracted from metadata

    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [voiceVolume, setVoiceVolume] = useState<number>(1);
    const [musicVolume, setMusicVolume] = useState<number>(1);
    const [otherVolume, setOtherVolume] = useState<number>(1);
    const [currentTimestamp, setCurrentTimestamp] = useState<number>(0.1);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const [muteSpeaker, setMuteSpeaker] = useState<{ mute: boolean, prevVolume: number }>({ mute: false, prevVolume: 1 });
    const [muteMusic, setMuteMusic] = useState<{ mute: boolean, prevVolume: number }>({ mute: false, prevVolume: 1 });
    const [muteOther, setMuteOther] = useState<{ mute: boolean, prevVolume: number }>({ mute: false, prevVolume: 1 });
    const [highlight, setHighlight] = useState<boolean>(false);
    const [videoSource, setVideoSource] = useState<string>("/theSocialNetwork/theSocialNetwork.mp4");
    const [showVideo, setShowVideo] = useState<boolean>(true);

    const handleHighlight = () => {
        setShowVideo(false);
        setTimeout(() => {
            setHighlight(prev => !prev);
            if (highlight) {
                setVideoSource("/theSocialNetwork/theSocialNetwork.mp4");
            } else {
                setVideoSource("/theSocialNetwork/theSocialNetwork_highlight.mp4");
            }
            setShowVideo(true);
        }, 0);
    }

    useEffect(() => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && voice && music && other) {
            video.pause();
            voice.pause();
            music.pause();
            other.pause();

            video.currentTime = currentTimestamp;
            video.playbackRate = playbackRate;
            voice.currentTime = currentTimestamp;
            music.currentTime = currentTimestamp;
            other.currentTime = currentTimestamp;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlight]);

    const handleSlowDown = () => {
        if (playbackRate > 0.2) setPlaybackRate((prev) => prev - 0.1);
    };

    const handleSpeedUp = () => {
        if (playbackRate < 2) setPlaybackRate((prev) => prev + 0.1);
    };

    const handlePlayPause = (button: "play" | "pause"): void => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && voice && music && other) {
            if (button === "play") {
                video.play();
                voice.play();
                music.play();
                other.play();
                setCurrentTimestamp(video.currentTime);
            } else {
                video.pause();
                voice.pause();
                music.pause();
                other.pause();
                setCurrentTimestamp(video.currentTime);
            }
        }
    };

    const handleSeek = (value: number) => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;
        const time = value;

        if (video && voice && music && other) {
            video.currentTime = time;
            voice.currentTime = time;
            music.currentTime = time;
            other.currentTime = time;
            setCurrentTimestamp(time);
        }
    };

    const handleVoiceVolume = (val: number) => {
        setMuteSpeaker({ mute: false, prevVolume: val })
        setVoiceVolume(val);
    }

    const handleMusicVolume = (val: number) => {
        setMuteMusic({ mute: false, prevVolume: val })
        setMusicVolume(val);
    }

    const handleOtherVolume = (val: number) => {
        setMuteOther({ mute: false, prevVolume: val })
        setOtherVolume(val);
    }

    const handleSpeakerMute = () => {
        if (muteSpeaker.mute === true) {
            setVoiceVolume(muteSpeaker.prevVolume)
            setMuteSpeaker({ mute: false, prevVolume: muteSpeaker.prevVolume });
        } else {
            setMuteSpeaker({ mute: true, prevVolume: voiceVolume });
            setVoiceVolume(0);
        }
    }

    const handleMusicMute = () => {
        if (muteMusic.mute === true) {
            setMusicVolume(muteMusic.prevVolume)
            setMuteMusic({ mute: false, prevVolume: muteMusic.prevVolume });
        } else {
            setMuteMusic({ mute: true, prevVolume: musicVolume });
            setMusicVolume(0);
        }
    }

    const handleOtherMute = () => {
        if (muteOther.mute === true) {
            setOtherVolume(muteOther.prevVolume)
            setMuteOther({ mute: false, prevVolume: muteOther.prevVolume });
        } else {
            setMuteOther({ mute: true, prevVolume: otherVolume });
            setOtherVolume(0);
        }
    }

    const handleSkipForwards = () => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && voice && music && other) {
            const currentTime = video.currentTime;
            if (currentTime + 10 > duration) {
                video.currentTime = duration;
                voice.currentTime = duration;
                music.currentTime = duration;
                other.currentTime = duration;
            } else {
                video.currentTime = currentTime + 10;
                voice.currentTime = currentTime + 10;
                music.currentTime = currentTime + 10;
                other.currentTime = currentTime + 10;
            }
        }
    }

    const handleSkipBackwards = () => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && voice && music && other) {
            const currentTime = video.currentTime;
            if (currentTime - 10 <= 0) {
                video.currentTime = 0;
                voice.currentTime = 0;
                music.currentTime = 0;
                other.currentTime = 0;
            } else {
                video.currentTime = currentTime - 10;
                voice.currentTime = currentTime - 10;
                music.currentTime = currentTime - 10;
                other.currentTime = currentTime - 10;
            }
        }
    }

    const toggleFullscreen = () => {
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
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && voice && music && other) {
            const checkTime = () => {
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
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (video && voice && music && other) {
            video.playbackRate = playbackRate;
            voice.playbackRate = playbackRate;
            music.playbackRate = playbackRate;
            other.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (voiceRef.current) voiceRef.current.volume = voiceVolume;
        if (musicRef.current) musicRef.current.volume = musicVolume;
        if (otherRef.current) otherRef.current.volume = otherVolume;
    }, [voiceVolume, musicVolume, otherVolume]);

    useEffect(() => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const other = otherRef.current;

        if (!video || !voice || !music || !other) return;

        voice.muted = false;
        music.muted = false;
        other.muted = false;

        const syncAudio = () => {
            if (video.paused) {
                voice.pause();
                music.pause();
                other.pause();
            } else {
                voice.play().catch((e) => console.error("Voice play failed:", e));
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
            <div className="w-3/5 mx-auto" ref={videoContainerRef}>
                {showVideo && (
                    <Video id="video" ref={videoRef} controls={false} muted>
                        <source id="videoSource" src={videoSource} type="video/mp4" />
                    </Video>
                )}
                <audio id="voice" ref={voiceRef} src={"/theSocialNetwork/voice.mp3"} />
                <audio id="music" ref={musicRef} src={"/theSocialNetwork/music.mp3"} />
                <audio id="other" ref={otherRef} src={"/theSocialNetwork/other.mp3"} />
                {isFullScreen && (
                    <div className="absolute top-4 right-4 z-10" style={{ pointerEvents: "none" }}>
                        <button onClick={toggleFullscreen} style={{ pointerEvents: "auto" }} className="py-2 px-4 bg-gray-800 text-white rounded">
                            Exit Full Screen
                        </button>
                    </div>
                )}
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={toggleFullscreen}>Toggle Fullscreen 📺</button>
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
                    maxValue={duration} // HARD CODED - needs to be extracted from metadata
                    step={1}
                    value={currentTimestamp}
                    onChange={(val) => handleSeek(val as number)}
                />
                <p>{formatTime(currentTimestamp)} / {formatTime(duration)}</p>
            </div>

            <div>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handleSkipBackwards()}>
                    ⏪ 10s
                </button>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handlePlayPause("play")}
                >
                    Play ▶
                </button>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handlePlayPause("pause")}
                >
                    Pause ⏸
                </button>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handleSkipForwards()}>
                    10s ⏩
                </button>
            </div>

            <div>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handleHighlight()}>{highlight ? "Turn OFF spotlight ❌" : "Turn ON spotlight 💡"}</button>
            </div>

            <div>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={handleSlowDown}>
                    Slow Down
                </button>
                <label className="px-2">{Math.floor(playbackRate * 100)}%</label>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={handleSpeedUp}>
                    Speed Up
                </button>
            </div>

            <div className="m-auto">
                <div className="w-1/3 m-auto">
                    <label>Speaker volume - {Math.floor(voiceVolume * 100)}%</label>
                    <Slider
                        aria-label="SpeakerVolumeSlider"
                        name="voiceSlider"
                        size="lg"
                        classNames={{ track: "custom-slider-track" }}
                        color={muteSpeaker.mute ? "secondary" : "primary"}
                        defaultValue={voiceVolume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        onChange={(val) => handleVoiceVolume(val as number)}
                        endContent={
                            <button onClick={() => { handleSpeakerMute() }}>{muteSpeaker.mute ? ("🔇") : ("🔊")}</button>
                        }
                    />
                </div>
                <div className="w-1/3 m-auto">
                    <label>Music volume - {Math.floor(musicVolume * 100)}%</label>
                    <Slider
                        aria-label="MusicVolumeSlider"
                        name="musicSlider"
                        size="lg"
                        classNames={{ track: "custom-slider-track" }}
                        color={muteMusic.mute ? "secondary" : "primary"}
                        defaultValue={musicVolume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        onChange={(val) => handleMusicVolume(val as number)}
                        endContent={
                            <button onClick={() => { handleMusicMute() }}>{muteMusic.mute ? ("🔇") : ("🔊")}</button>
                        }
                    />
                </div>
                <div className="w-1/3 m-auto">
                    <label>Other volume - {Math.floor(otherVolume * 100)}%</label>
                    <Slider
                        aria-label="OtherVolumeSlider"
                        name="otherSlider"
                        size="lg"
                        classNames={{ track: "custom-slider-track" }}
                        color={muteOther.mute ? "secondary" : "primary"}
                        defaultValue={otherVolume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        onChange={(val) => handleOtherVolume(val as number)}
                        endContent={
                            <button onClick={() => { handleOtherMute() }}>{muteOther.mute ? ("🔇") : ("🔊")}</button>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default TheSocialNetwork;
