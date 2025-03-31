import React, { CSSProperties } from 'react';
import { Play, Pause, LucideIcon, Rewind, FastForward, Captions, CaptionsOff, SmilePlus, Undo2, Lightbulb, LightbulbOff, Snail, Rabbit, CircleX, CircleCheck, Expand, Shrink } from 'lucide-react';

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
    "exitfullscreen": Shrink
};

const colorMap: Record<string, string> = {
    blue: "bg-blue-700 hover:bg-blue-800",
    amber: "bg-amber-600 hover:bg-amber-700",
    green: "bg-green-700 hover:bg-green-800",
    purple: "bg-purple-700 hover:bg-purple-800"
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
            <span className="flex items-center justify-center w-full">
                <span>{text}</span>
                <IconComponent strokeWidth={2.75} className="ml-2 h-[1em] w-[1em]" />
            </span>
        </button>
    );
};

export default IconButton;