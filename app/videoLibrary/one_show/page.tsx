// ./app/videoLibrary/one_show/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const OneShow = () => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const name = localStorage.getItem("ca11yDeploymentName");

                if (name) {
                    logAction(name, "Watching the video One Show.")
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
            <VideoPlayer videoName="one_show" muxAssetId={{ original: "oaspPgUKcDxQ3FtUGYXgArn9TwKFPcVT4NI4p9snAsM", highlight: "j1W02tk5FKM9rZt3eQ01FJp01S6Q3iCRVy6iV3qcsAyJPk" }} />
            {/* <VideoPlayer videoName="one_show" /> */}
        </div>
    )
}

export default OneShow;