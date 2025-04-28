// ./app/videoLibrary/weakest_link/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const WeakestLink = () => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const name = localStorage.getItem("ca11yDeploymentName");

                if (name) {
                    logAction(name, "Watching the video Weakest Link.")
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
            {/* <VideoPlayer videoName="weakest_link" muxAssetId={{ original: "", highlight: "" }} /> */}
            <VideoPlayer videoName="weakest_link" />
        </div>
    )
}

export default WeakestLink;