// ./app/components/PlaybackSpeedControls.tsx

import IconButton from "./IconButton";
import { HelpCircle } from "lucide-react";
import { PlaybackSpeedControlsProps } from "../api/types";

const PlaybackSpeedControls = ({ playbackRate, isSpeedAutomated, onSlowDown, onSpeedUp, onToggleAutomateSpeed, onOpenHelp }: PlaybackSpeedControlsProps) => {
    return (
        <div className="bg-warmGreen-100 px-6 py-4 rounded-xl">
            <h3 className="font-bold text-base mb-4 flex justify-between items-center">
                <span>
                    Playback Speed <span className="inline bg-warmGreen-300 mx-2 px-2 py-1 rounded">
                        {isSpeedAutomated ? `Auto - ${Math.round(playbackRate * 100)}%` : `${Math.round(playbackRate * 100)}%`}
                    </span>
                </span>
                <button
                    onClick={() => onOpenHelp("speed")}
                    className="p-1 ml-2 text-warmGreen-600 hover:text-warmGreen-800 transition-colors"
                    aria-label="Playback speed help"
                >
                    <HelpCircle size={"1.5em"} />
                </button>
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
                {isSpeedAutomated ?
                    (<IconButton text="Slow Down" icon="slowDown" color="green" disabled />)
                    : (<IconButton text="Slow Down" icon="slowDown" color="green" onClickFunction={onSlowDown} />)
                }
                {isSpeedAutomated ?
                    (<IconButton text="Speed Up" icon="speedUp" color="green" disabled />)
                    : (<IconButton text="Speed Up" icon="speedUp" color="green" onClickFunction={onSpeedUp} />)
                }
            </div>
            {isSpeedAutomated ?
                (<IconButton text="Automated Speed" icon="check" color="green" onClickFunction={onToggleAutomateSpeed} />)
                : (<IconButton text="Automated Speed" icon="cross" color="green" onClickFunction={onToggleAutomateSpeed} />)
            }
        </div>
    );
};

export default PlaybackSpeedControls;