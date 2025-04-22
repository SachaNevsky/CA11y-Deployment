// ./lib/mux.ts

import Mux from '@mux/mux-node';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID || '',
    tokenSecret: process.env.MUX_TOKEN_SECRET || '',
});

export const uploadVideoToMux = async (fileName: string) => {
    try {
        const asset = await mux.video.assets.create({
            inputs: [{ url: fileName }],
            playback_policies: ['public'],
        });
        return asset;
    } catch (error) {
        console.error('Error uploading to Mux:', error);
        throw error;
    }
};

export const getMuxAsset = async (assetId: string) => {
    try {
        // use `retrieve`, not `get`
        return await mux.video.assets.retrieve(assetId);
    } catch (error) {
        console.error('Error getting Mux asset:', error);
        throw error;
    }
};
