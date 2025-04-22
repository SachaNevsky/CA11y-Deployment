// ./app/components/VolumeControls.tsx

"use client";

import { Slider } from "@heroui/slider";
import { HelpCircle } from "lucide-react";
import { VolumeControlsProps, VolumeSliderProps } from "../api/types";

const VolumeControls = ({
    speakerControl,
    musicControl,
    otherControl,
    onSpeakerVolumeChange,
    onMusicVolumeChange,
    onOtherVolumeChange,
    onSpeakerMute,
    onMusicMute,
    onOtherMute,
    onOpenHelp
}: VolumeControlsProps) => {
    return (
        <div className="bg-blue-100 px-6 py-4 rounded-xl">
            <h3 className="font-bold text-base mb-4 flex justify-between items-center">
                <span>Volume Controls</span>
                <button
                    onClick={() => onOpenHelp("volume")}
                    className="p-1 ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                    aria-label="Volume controls help"
                >
                    <HelpCircle size={"1.5em"} />
                </button>
            </h3>

            <VolumeSlider
                label="Speaker"
                control={speakerControl}
                onChange={onSpeakerVolumeChange}
                onMute={onSpeakerMute}
            />

            <VolumeSlider
                label="Music"
                control={musicControl}
                onChange={onMusicVolumeChange}
                onMute={onMusicMute}
            />

            <VolumeSlider
                label="Background"
                control={otherControl}
                onChange={onOtherVolumeChange}
                onMute={onOtherMute}
                lastItem
            />
        </div>
    );
};

const VolumeSlider = ({ label, control, onChange, onMute, lastItem = false }: VolumeSliderProps) => {
    return (
        <div className={lastItem ? "" : "mb-2"}>
            <label className="font-semibold block mb-1">
                {label} <span className="inline bg-blue-300 mx-2 px-2 py-1 rounded">{control.muted ? "Muted" : `${Math.floor(control.volume * 100)}%`}</span>
            </label>
            <div className="flex items-center py-2">
                <div className="flex-grow">
                    <Slider
                        aria-label={`${label}VolumeSlider`}
                        name={`${label.toLowerCase()}Slider`}
                        size="lg"
                        classNames={{ track: "custom-slider-track" }}
                        color={control.muted ? "secondary" : "primary"}
                        defaultValue={control.volume}
                        minValue={0}
                        maxValue={1}
                        step={0.05}
                        value={control.volume}
                        onChange={(val) => onChange(val as number)}
                    />
                </div>
                <button
                    className="ml-2 p-1 border rounded-md"
                    onClick={onMute}
                >
                    {control.muted ? ("🔇") : ("🔊")}
                </button>
            </div>
        </div>
    );
};

export default VolumeControls;