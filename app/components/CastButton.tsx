"use client";
import { useEffect, useState } from "react";

const CastButton = () => {
    const [castAvailable, setCastAvailable] = useState(false);

    useEffect(() => {
        // Define the callback before loading the script.
        window.__onGCastApiAvailable = function (isAvailable: boolean) {
            if (isAvailable) {
                setCastAvailable(true);
                window.cast.framework.CastContext.getInstance().setOptions({
                    receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                    autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
                });
            }
        };

        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
        script.async = true;
        // script.crossOrigin = "anonymous";
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const onCast = () => {
        if (!castAvailable) {
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
                        (error) => console.error("Error loading media:", error)
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
