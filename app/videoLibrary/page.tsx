"use client"

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import { logAction } from "@/lib/logAction";

const VideoLibrary = () => {
    const videoNames = ["theSocialNetwork"];

    const [name, setName] = useState("");
    const [aphasiaCharacteristics, setAphasiaCharacteristics] = useState();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedName = localStorage.getItem("ca11yDeploymentName");
            const storedAphasiaCharacteristic = localStorage.getItem("ca11yAphasiaCharacteristics");

            if (storedName) setName(storedName);

            try {
                if (storedAphasiaCharacteristic) setAphasiaCharacteristics(JSON.parse(storedAphasiaCharacteristic));
            } catch {
                localStorage.removeItem("ca11yAphasiaCharacteristics");
                window.open("/", "_self");
            }
        }
    }, []);

    useEffect(() => {
        console.log(aphasiaCharacteristics);
    }, [aphasiaCharacteristics]);

    const handleVideoClick = (video: string): void => {
        const name = localStorage.getItem("ca11yDeploymentName")

        if (name) logAction(name, `Selected the video ${video}`);

        window.open(`/videoLibrary/${video}`, "_self")
    }

    const handleDeleteCharacteristics = () => {
        const name = localStorage.getItem("ca11yDeploymentName")

        if (name) logAction(name, "Deleted their aphasia characteristics.");

        localStorage.removeItem("ca11yAphasiaCharacteristics");
        window.open("/", "_self");
    }

    return (
        <div className="m-auto text-center">
            Hello {name}, this is our video library.<br />Choose something to watch.
            <div>
                <button className="py-2 px-4 m-4 border-solid border-2 rounded-md border-gray-500" onClick={() => { handleDeleteCharacteristics() }}>Delete aphasia characteristics</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {videoNames.map(video => {
                    return (
                        <button key={video} onClick={() => handleVideoClick(video)}>
                            <VideoCard name={video} />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default VideoLibrary;