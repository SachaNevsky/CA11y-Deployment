// ./app/api/helpContent.ts

import { HelpSection } from "./types";

type HelpContent = {
    title: string;
    content: string;
};

export const HELP_CONTENT: Record<HelpSection, HelpContent> = {
    captions: {
        title: "Captions Help",
        content:
            "Captions show <strong>dialogue</strong> as <strong>text</strong>. You can turn captions <strong>ON</strong> or <strong>OFF</strong>, or switch to a <strong>simplified version</strong>.",
    },
    spotlight: {
        title: "Spotlight Help",
        content:
            "Spotlight <strong>highlights</strong> the <strong>current speaker</strong>. You can turn spotlight <strong>ON</strong> or <strong>OFF</strong>.",
    },
    speed: {
        title: "Playback Speed Help",
        content:
            "Playback speed controls <strong>how fast</strong> the <strong>video</strong> is playing. You can <strong>speed up</strong> or <strong>slow down</strong> the video. You can also make the <strong>system automate</strong> the <strong>speed</strong>.",
    },
    volume: {
        title: "Volume Controls Help",
        content:
            "Volume controls <strong>how loud</strong> different <strong>audio</strong> is. You can <strong>control</strong> the <strong>speaker</strong>, <strong>music</strong> and <strong>background</strong> audio. You can also <strong>mute</strong> audio you do not want.",
    },
    default: {
        title: "Help",
        content: "Need assistance with the video player controls?",
    },
};