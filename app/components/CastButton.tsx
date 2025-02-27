"use client";
import { useEffect } from "react";

const CastButton = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
        script.async = true;
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);

        script.onload = () => {
            window.__onGCastApiAvailable = (isAvailable: boolean) => {
                if (
                    isAvailable &&
                    window.cast &&
                    window.cast.framework &&
                    window.chrome &&
                    window.chrome.cast &&
                    window.chrome.cast.media
                ) {
                    window.cast.framework.CastContext.getInstance().setOptions({
                        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                    });
                }
            };
        };
    }, []);

    const onCast = () => {
        // Ensure the Cast globals are available via window
        if (
            typeof window.cast === "undefined" ||
            !window.cast.framework ||
            typeof window.chrome === "undefined" ||
            !window.chrome.cast ||
            !window.chrome.cast.media
        ) {
            alert("Casting is not supported on this browser. Please use a supported browser like Chrome or Edge.");
            return;
        }

        const castContext = window.cast.framework.CastContext.getInstance();
        castContext
            .requestSession()
            .then(() => {
                const session = castContext.getCurrentSession();
                if (session) {
                    const mediaUrl = `${window.location.origin}/theSocialNetwork/theSocialNetwork.mp4`;
                    const mediaInfo = new window.chrome.cast.media.MediaInfo(mediaUrl, "video/mp4");
                    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
                    session.loadMedia(request).then(
                        () => console.log("Media loaded successfully"),
                        (error) =>
                            console.error("Error loading media:", error)
                    );
                }
            })
            .catch((error) =>
                console.error("Error starting cast session:", error)
            );
    };

    return <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={onCast}>Cast to Chromecast</button>;
};

export default CastButton;
