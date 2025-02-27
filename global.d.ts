/* eslint-disable no-var */
import mongoose from 'mongoose';

declare global {
    let mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };

    interface Window {
        __onGCastApiAvailable: (isAvailable: boolean) => void;
        cast: {
            framework: {
                CastContext: {
                    getInstance: () => CastContextInstance;
                };
            };
        };
        chrome: {
            cast: {
                media: {
                    DEFAULT_MEDIA_RECEIVER_APP_ID: string;
                    MediaInfo: new (contentId: string, contentType: string) => MediaInfo;
                    LoadRequest: new (mediaInfo: MediaInfo) => CastLoadRequest;
                };
                AutoJoinPolicy: {
                    ORIGIN_SCOPED: string;
                };
            };
        };
    }
}

interface MediaInfo {
    contentId: string;
    contentType: string;
}

interface CastLoadRequest {
    media: MediaInfo;
}

interface CastContextInstance {
    setOptions: (options: { receiverApplicationId: string; autoJoinPolicy: string }) => void;
    requestSession: () => Promise<void>;
    getCurrentSession: () => { loadMedia: (request: CastLoadRequest) => Promise<void> } | null;
}

export { };
