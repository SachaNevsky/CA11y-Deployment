// ./app/components/CaptionControls.tsx

import IconButton from "./IconButton";
import { HelpCircle } from "lucide-react";
import { CaptionControlsProps } from "../api/types";

const CaptionControls = ({ captionMode, onCaptionsToggle, onSimpleCaptions, onOpenHelp }: CaptionControlsProps) => {
    return (
        <div className="bg-purple-100 px-6 py-4 rounded-xl">
            <h3 className="font-bold text-base mb-4 flex justify-between items-center">
                <span>
                    Captions <span className="inline bg-purple-300 mx-2 px-2 py-1 rounded">
                        {captionMode === "none" ? "Off" : captionMode === "default" ? "On" : "Simplified"}
                    </span>
                </span>
                <button
                    onClick={() => onOpenHelp("captions")}
                    className="p-1 ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                    aria-label="Captions help"
                >
                    <HelpCircle size={"1.5em"} />
                </button>
            </h3>
            <div className="flex flex-row gap-3">
                {captionMode === "none" ?
                    (<IconButton text="Turn ON captions" icon="captionsOn" color="purple" onClickFunction={onCaptionsToggle} />)
                    : (<IconButton text="Turn OFF captions" icon="captionsOff" color="purple" onClickFunction={onCaptionsToggle} />)
                }
                {captionMode !== "none" && (
                    captionMode === "default" ? (
                        <IconButton text="Make simple" icon="captionsEasier" color="purple" onClickFunction={onSimpleCaptions} />
                    ) : (
                        <IconButton text="Return default" icon="captionsDefault" color="purple" onClickFunction={onSimpleCaptions} />
                    )
                )}
            </div>
        </div>
    );
};

export default CaptionControls;