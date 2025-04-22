// ./app/videoLibrary/theSocialNetwork/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const TheSocialNetwork = () => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const name = localStorage.getItem("ca11yDeploymentName");

                if (name) {
                    logAction(name, "Watching the video theSocialNetwork.")
                        .catch((error) => {
                            console.error("Failed to log action:", error);
                        });
                } else {
                    console.error("No ca11yDeploymentName stored.")
                }
            } catch (error) {
                console.error("Error in useEffect:", error);
            }
        }
    }, []);

    return (
        <div className="m-1">
            <VideoPlayer videoName="theSocialNetwork" muxAssetId={{ original: "l9G5Me8Mwz5009FiNowaldgOd6Mr1n5YVtvch02r59sew", highlight: "TwIChxe902xtC3lCZ8lglSl00oE02suvBTdZXhlNx4HCtI" }} />
        </div>
    )
}

export default TheSocialNetwork;