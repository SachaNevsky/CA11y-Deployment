import React, { CSSProperties } from 'react';
import { Play, Pause, LucideIcon, Rewind, FastForward, Captions, CaptionsOff, SmilePlus, Undo2, Lightbulb, LightbulbOff, Snail, Rabbit, CircleX, CircleCheck, Expand, Shrink, HelpCircle } from 'lucide-react';
import parse from "html-react-parser";

const iconMap: Record<string, LucideIcon> = {
    "play": Play,
    "pause": Pause,
    "rewind": Rewind,
    "forwards": FastForward,
    "captionson": Captions,
    "captionsoff": CaptionsOff,
    "captionseasier": SmilePlus,
    "captionsdefault": Undo2,
    "spotlight": Lightbulb,
    "spotlightoff": LightbulbOff,
    "speedup": Rabbit,
    "slowdown": Snail,
    "check": CircleCheck,
    "cross": CircleX,
    "fullscreen": Expand,
    "exitfullscreen": Shrink,
    "help": HelpCircle
};

const colorMap: Record<string, string> = {
    blue: "bg-blue-400 hover:bg-blue-500",
    amber: "bg-warmAmber-300 hover:bg-warmAmber-400",
    green: "bg-warmGreen-300 hover:bg-warmGreen-400",
    purple: "bg-purple-300 hover:bg-purple-400"
};

interface IconButtonProps {
    text: string;
    onClickFunction?: (arg?: string) => void;
    color?: string;
    icon?: string;
    className?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    style?: CSSProperties;
}

const IconButton: React.FC<IconButtonProps> = ({
    text,
    onClickFunction,
    color = "blue",
    icon = "play",
    className = "",
    fullWidth = true,
    disabled = false,
    style
}) => {
    const IconComponent: LucideIcon = iconMap[icon.toLowerCase()] || Play;
    const isDisabled = disabled || !onClickFunction;
    const colorClass = isDisabled ? "bg-gray-200" : (colorMap[color.toLowerCase()] || "bg-blue-500 hover:bg-blue-600");
    const baseButtonClass = "px-4 py-4 rounded-md font-medium transition-colors duration-200 shadow-md";
    const widthClass = fullWidth ? "w-full flex-grow" : "";
    const stateClasses = isDisabled ? "text-gray-600 cursor-not-allowed" : "text-white cursor-pointer";

    return (
        <button
            className={`${baseButtonClass} ${colorClass} ${widthClass} ${stateClasses} ${className}`}
            onClick={onClickFunction ? () => onClickFunction() : undefined}
            disabled={isDisabled}
            style={style}
        >
            <span className="flex items-center justify-center w-full text-black">
                <span>{parse(text)}</span>
                <IconComponent strokeWidth={2.75} className="ml-2 h-[1.3em] w-[1.3em]" />
            </span>
        </button>
    );
};

export default IconButton;