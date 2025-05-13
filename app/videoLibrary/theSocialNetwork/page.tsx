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
            <VideoPlayer videoName="theSocialNetwork" muxAssetId={{ original: "Z028U3zCXmoR6rsKBpbPXIkfeB9sXWINj7PIA6a37n00I", highlight: "RSHR8iFShwvQCJMFEzRCMOjnkF00Fs4TVRgTOCmJNfao" }} />
            {/* <VideoPlayer videoName="theSocialNetwork" /> */}
        </div>
    )
}

export default TheSocialNetwork;