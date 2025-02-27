"use client";

import Video from "next-video";
import { useEffect, useState, useRef } from "react";
import { Slider } from "@heroui/slider";
import CastButton from "@/app/components/CastButton";

const TheSocialNetwork = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const voiceRef = useRef<HTMLAudioElement | null>(null);
    const musicRef = useRef<HTMLAudioElement | null>(null);
    const crowdRef = useRef<HTMLAudioElement | null>(null);

    const [playbackRate, setPlaybackRate] = useState(1);
    const [voiceVolume, setVoiceVolume] = useState(1);
    const [musicVolume, setMusicVolume] = useState(1);
    const [crowdVolume, setCrowdVolume] = useState(1);
    const [currentTimestamp, setCurrentTimestamp] = useState(0.1);

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
        const crowd = crowdRef.current;

        if (video && voice && music && crowd) {
            if (button === "play") {
                video.play();
                voice.play();
                music.play();
                crowd.play();
                setCurrentTimestamp(video.currentTime);
            } else {
                video.pause();
                voice.pause();
                music.pause();
                crowd.pause();
                setCurrentTimestamp(video.currentTime);
            }
        }
    };

    const handleSeek = (value: number) => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const crowd = crowdRef.current;
        const time = value;

        if (video && voice && music && crowd) {
            video.currentTime = time;
            voice.currentTime = time;
            music.currentTime = time;
            crowd.currentTime = time;
            setCurrentTimestamp(time);
        }
    }

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const crowd = crowdRef.current;

        if (video && voice && music && crowd) {
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
        const crowd = crowdRef.current;

        if (video && voice && music && crowd) {
            video.playbackRate = playbackRate;
            voice.playbackRate = playbackRate;
            music.playbackRate = playbackRate;
            crowd.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (voiceRef.current) voiceRef.current.volume = voiceVolume;
        if (musicRef.current) musicRef.current.volume = musicVolume;
        if (crowdRef.current) crowdRef.current.volume = crowdVolume;
    }, [voiceVolume, musicVolume, crowdVolume]);

    useEffect(() => {
        const video = videoRef.current;
        const voice = voiceRef.current;
        const music = musicRef.current;
        const crowd = crowdRef.current;

        if (!video || !voice || !music || !crowd) return;

        voice.muted = false;
        music.muted = false;
        crowd.muted = false;

        const syncAudio = () => {
            if (video.paused) {
                voice.pause();
                music.pause();
                crowd.pause();
            } else {
                voice.play().catch((e) => console.error("Voice play failed:", e));
                music.play().catch((e) => console.error("Music play failed:", e));
                crowd.play().catch((e) => console.error("Crowd play failed:", e));
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
            <div className="w-3/5 mx-auto">
                <Video id="video" ref={videoRef} controls={false} muted>
                    <source
                        id="videoSource"
                        src={"/theSocialNetwork/theSocialNetwork.mp4"}
                        type="video/mp4"
                    />
                </Video>
                <audio id="voice" ref={voiceRef} src={"/theSocialNetwork/voice.mp3"} />
                <audio id="music" ref={musicRef} src={"/theSocialNetwork/music.mp3"} />
                <audio id="crowd" ref={crowdRef} src={"/theSocialNetwork/crowd.mp3"} />
            </div>

            <div className="w-3/5 mx-auto my-4">
                <CastButton />
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
                    maxValue={78} // HARD CODED - needs to be extracted from metadata
                    step={1}
                    value={currentTimestamp}
                    onChange={(val) => handleSeek(val as number)}
                />
                <p>{formatTime(currentTimestamp)} / {formatTime(78)}</p>
            </div>

            <div>
                <button
                    className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500"
                    onClick={() => handlePlayPause("play")}
                >
                    Play
                </button>
                <button
                    className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500"
                    onClick={() => handlePlayPause("pause")}
                >
                    Pause
                </button>
            </div>

            <div>
                <button
                    className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500"
                    onClick={handleSlowDown}
                >
                    Slow Down
                </button>
                <label className="px-2">{Math.floor(playbackRate * 100)}%</label>
                <button
                    className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500"
                    onClick={handleSpeedUp}
                >
                    Speed Up
                </button>
            </div>

            <div className="m-auto">
                <div className="w-1/3 m-auto">
                    <label>Speaker volume - {Math.floor(voiceVolume * 100)}%</label>
                    <Slider
                        aria-label="SpeakerVolumeSlider"
                        name="voiceSlider"
                        classNames={{ track: "custom-slider-track" }}
                        defaultValue={voiceVolume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        onChange={(val) => setVoiceVolume(val as number)}
                    />
                </div>
                <div className="w-1/3 m-auto">
                    <label>Music volume - {Math.floor(musicVolume * 100)}%</label>
                    <Slider
                        aria-label="MusicVolumeSlider"
                        name="musicSlider"
                        classNames={{ track: "custom-slider-track" }}
                        defaultValue={musicVolume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        onChange={(val) => setMusicVolume(val as number)}
                    />
                </div>
                <div className="w-1/3 m-auto">
                    <label>Other volume - {Math.floor(crowdVolume * 100)}%</label>
                    <Slider
                        aria-label="CrowdVolumeSlider"
                        name="crowdSlider"
                        classNames={{ track: "custom-slider-track" }}
                        defaultValue={crowdVolume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        onChange={(val) => setCrowdVolume(val as number)}
                    />
                </div>
            </div>
        </div>
    );
};

export default TheSocialNetwork;
