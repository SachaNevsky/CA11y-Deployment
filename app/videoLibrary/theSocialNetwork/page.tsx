"use client"

import VideoPlayer from "@/app/components/VideoPlayer"
import { logAction } from "@/lib/logger";
import { useEffect } from "react"

const TheSocialNetwork = () => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const name = localStorage.getItem("ca11yDeploymentName");

            if (name) logAction(name, "Watching the video theSocialNetwork.")
        }
    }, []);

    return (
        <VideoPlayer videoName="theSocialNetwork" />
    )
}

export default TheSocialNetwork