// ./app/videoLibrary/theSocialNetwork/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const TheSocialNetwork = () => {
    useEffect(() => {
        // Ensure this runs only on the client side
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
        <VideoPlayer videoName="theSocialNetwork" />
    )
}

export default TheSocialNetwork;