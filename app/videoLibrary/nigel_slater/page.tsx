// ./app/videoLibrary/nigel_slater/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const NigelSlater = () => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const name = localStorage.getItem("ca11yDeploymentName");

                if (name) {
                    logAction(name, "Watching the video Nigel Slater.")
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
            {/* <VideoPlayer videoName="nigel_slater" muxAssetId={{ original: "", highlight: "" }} /> */}
            <VideoPlayer videoName="nigel_slater" />
        </div>
    )
}

export default NigelSlater;