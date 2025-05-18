"use client"

import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import { logAction } from "@/lib/logAction";

const VideoLibrary = () => {
    const videos = [
        { name: "The Social Network", video: "theSocialNetwork", info: { year: "2010", type: "Drama film" } },
        { name: "Asia", video: "asia", info: { year: "2024", type: "Nature documentary" } },
        { name: "Nigel Slater's Middle East", video: "nigel_slater", info: { year: "2018", type: "Cooking show" } },
        { name: "The One Show", video: "one_show", info: { year: "2025", type: "Talk show" } },
        { name: "Black Books", video: "black_books", info: { year: "2000", type: "Comedy TV show" } },
        { name: "The Weakest Link", video: "weakest_link", info: { year: "2025", type: "Quiz show" } }
    ];

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
        const name = localStorage.getItem("ca11yDeploymentName");

        if (name) logAction(name, `Selected the video ${video}`);

        window.open(`/videoLibrary/${video}`, "_self");
    }

    // const handleDeleteCharacteristics = () => {
    //     const name = localStorage.getItem("ca11yDeploymentName")

    //     if (name) logAction(name, "Deleted their aphasia characteristics.");

    //     localStorage.removeItem("ca11yAphasiaCharacteristics");
    //     window.open("/", "_self");
    // }

    return (
        <div className="m-auto w-[90%] text-center">
            <p className="text-2xl font-semibold pt-4">Hello <span className="text-2xl font-bold">{name}</span>!<br />Choose something to watch.</p>
            {/* <div>
                <button className="py-2 px-4 m-4 border-solid border-2 rounded-md border-gray-500" onClick={() => { handleDeleteCharacteristics() }}>Delete aphasia characteristics</button>
            </div> */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                {videos.map(video => {
                    return (
                        <button key={video.video} onClick={() => handleVideoClick(video.video)}>
                            <VideoCard name={video.name} video={video.video} info={video.info} />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default VideoLibrary;