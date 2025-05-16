// ./app/videoLibrary/black_books/page.tsx
"use client";

import VideoPlayer from "@/app/components/VideoPlayer";
import { logAction } from "@/lib/logAction";
import { useEffect } from "react";

const BlackBooks = () => {

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const name = localStorage.getItem("ca11yDeploymentName");

                if (name) {
                    logAction(name, "Watching the video Black Books.")
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
            <VideoPlayer videoName="black_books" muxAssetId={{ original: "V00E46f6p4Y62MaQSs202vFn8w8y02HO00BQdEPMVV5uIg4", highlight: "" }} />
            {/* <VideoPlayer videoName="nigel_slater" /> */}
        </div>
    )
}

export default BlackBooks;