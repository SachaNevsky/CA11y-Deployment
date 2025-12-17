// types.ts
export interface AudioControls {
    volume: number;
    muted: boolean;
    prevVolume: number;
}

export interface VideoMetadata {
    muxPlaybackId: string;
    muxHighlightPlaybackId: string;
    thumbnailUrl?: string;
    duration: number;
    subtitles?: {
        start_time: number;
        end_time: number;
        text: string;
        flesch_reading_ease: number;
        words_per_minute: number;
        complexity_score: number;
    }[];
}

export interface VideoPlayerSettings {
    captionMode: "none" | "default" | "simplified";
    playbackRate: number;
    manualPlaybackRate: number;
    isSpeedAutomated: boolean;
    highlight: boolean;
    speakerControl: AudioControls;
    musicControl: AudioControls;
    otherControl: AudioControls;
}

export interface VideoPlayerProps {
    videoName: string;
    muxAssetId?: {
        original: string;
        highlight: string;
    };
}

export interface EMAQuestion {
    id: string;
    text: string;
    condition: string;
}

export interface EMAState {
    isOpen: boolean;
    currentQuestion: EMAQuestion | null;
    lastAction: string;
}

export interface EMAResponse {
    questionId: string;
    question: string;
    response: number;
    timestamp: Date;
}

export interface EMADocument {
    user: string;
    responses: EMAResponse[];
    createdAt: Date;
}

type StreamType = 'on-demand' | 'live' | 'dvr';
type PreloadType = 'auto' | 'metadata' | 'none';
export interface MuxVideoConfig {
    playbackId: string;
    streamType: StreamType;
    preload: PreloadType;
}

export interface VolumeControlsProps {
    speakerControl: AudioControls;
    musicControl: AudioControls;
    otherControl: AudioControls;
    onSpeakerVolumeChange: (val: number) => void;
    onMusicVolumeChange: (val: number) => void;
    onOtherVolumeChange: (val: number) => void;
    onSpeakerMute: () => void;
    onMusicMute: () => void;
    onOtherMute: () => void;
    onOpenHelp: (section: string) => void;
}

export interface VolumeSliderProps {
    label: string;
    control: AudioControls;
    onChange: (val: number) => void;
    onMute: () => void;
    lastItem?: boolean;
}

export interface CaptionControlsProps {
    captionMode: "none" | "default" | "simplified";
    onCaptionsToggle: () => void;
    onSimpleCaptions: () => void;
    onOpenHelp: (section: string) => void;
}

export interface FullscreenControlsProps {
    isUserActive: boolean;
    currentTimestamp: number;
    duration: number;
    onSkipBackwards: () => void;
    onPlayPause: (action: "play" | "pause") => void;
    onSkipForwards: () => void;
    onSeek: (value: number) => void;
    onExitFullscreen: () => void;
}

export interface PlaybackSpeedControlsProps {
    playbackRate: number;
    isSpeedAutomated: boolean;
    onSlowDown: () => void;
    onSpeedUp: () => void;
    onToggleAutomateSpeed: () => void;
    onOpenHelp: (section: string) => void;
}

export interface SpotlightControlsProps {
    highlight: boolean;
    onHighlightToggle: () => void;
    onOpenHelp: (section: string) => void;
}

export type HelpSection = "captions" | "spotlight" | "speed" | "volume" | "default";