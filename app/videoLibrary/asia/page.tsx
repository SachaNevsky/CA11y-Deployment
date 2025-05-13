// ./app/videoLibrary/asia/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const Asia = () => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const name = localStorage.getItem("ca11yDeploymentName");

                if (name) {
                    logAction(name, "Watching the video Asia.")
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
            <VideoPlayer videoName="asia" muxAssetId={{ original: "aMrs9Ln3F02ZMEQxsV02OU5A7kLRGC80201UZXagxnyAgkY", highlight: "4CS01BHR9ldoc200LoxDcrWkD01D008zfhzPlTVaFPa7kt8" }} />
            {/* <VideoPlayer videoName="asia" /> */}
        </div>
    )
}

export default Asia;