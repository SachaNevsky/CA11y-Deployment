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
    muxAssetId: {
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