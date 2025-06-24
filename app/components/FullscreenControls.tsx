// ./app/components/FullscreenControls.tsx

import { Slider } from "@heroui/slider";
import IconButton from "./IconButton";
import { FullscreenControlsProps } from "../api/types";

const FullscreenControls = ({ isUserActive, currentTimestamp, duration, onSkipBackwards, onPlayPause, onSkipForwards, onSeek, onExitFullscreen }: FullscreenControlsProps) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // const handlePlay = () => {
    //     onPlayPause("play");
    //     setTimeout(() => {
    //         onPlayPause("play")
    //     }, 2000)
    // }

    return (
        <>
            <div className="absolute top-4 right-4 z-10" style={{ pointerEvents: "none", opacity: isUserActive ? 1 : 0, transition: "opacity 200ms ease-in-out" }}>
                <IconButton
                    text="Exit Fullscreen"
                    icon="exitFullscreen"
                    onClickFunction={onExitFullscreen}
                    style={{ pointerEvents: "auto" }}
                    className="bg-black/50 text-white hover:bg-black/75 p-2 rounded"
                />
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10" style={{ opacity: isUserActive ? 1 : 0, transition: "opacity 200ms ease-in-out" }}>
                <div className="bg-black/60 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-4 mb-3">
                        <IconButton text="10s" icon="rewind" onClickFunction={onSkipBackwards} className="text-white" aria-label="Skip backward 10 seconds" />
                        <IconButton text="Play" icon="play" onClickFunction={() => onPlayPause("play")} className="text-white" aria-label="Play video" />
                        {/* <IconButton text="Play" icon="play" onClickFunction={handlePlay} className="text-white" aria-label="Play video" /> */}
                        <IconButton text="Pause" icon="pause" onClickFunction={() => onPlayPause("pause")} className="text-white" aria-label="Pause video" />
                        <IconButton text="10s" icon="forwards" onClickFunction={onSkipForwards} className="text-white" aria-label="Skip forward 10 seconds" />
                    </div>
                    <div>
                        <div className="flex-grow mx-2">
                            <Slider
                                aria-label="SeekbarSlider"
                                name="seekSlider"
                                color="primary"
                                size="lg"
                                classNames={{ track: "custom-slider-track-fullscreen" }}
                                defaultValue={currentTimestamp}
                                minValue={0}
                                maxValue={duration}
                                step={1}
                                value={currentTimestamp}
                                onChange={(val) => onSeek(val as number)}
                            />
                        </div>
                        <p className="text-white text-sm font-mono text-center">
                            {formatTime(currentTimestamp)} / {formatTime(duration)}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FullscreenControls;