// ./app/components/SpotlightControls.tsx

import IconButton from "./IconButton";
import { HelpCircle } from "lucide-react";
import { SpotlightControlsProps } from "../api/types";

const SpotlightControls = ({ highlight, onHighlightToggle, onOpenHelp }: SpotlightControlsProps) => {
    return (
        <div className="bg-warmAmber-100 px-6 py-4 rounded-xl">
            <h3 className="font-bold text-base mb-4 flex justify-between items-center">
                <span>
                    Spotlight <span className="inline bg-warmAmber-300 mx-2 px-2 py-1 rounded">
                        {highlight ? "On" : "Off"}
                    </span>
                </span>
                <button
                    onClick={() => onOpenHelp("spotlight")}
                    className="p-1 ml-2 text-warmAmber-600 hover:text-warmAmber-800 transition-colors"
                    aria-label="Spotlight help"
                >
                    <HelpCircle size={"1.5em"} />
                </button>
            </h3>
            {highlight ?
                (<IconButton text="Turn OFF spotlight" icon="spotlightOff" color="amber" onClickFunction={onHighlightToggle} />)
                : (<IconButton text="Turn ON spotlight" icon="spotlight" color="amber" onClickFunction={onHighlightToggle} />)
            }
        </div>
    );
};

export default SpotlightControls;