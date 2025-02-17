"use client"

import Video from "next-video";
import { useEffect, useState } from "react";

const TheSocialNetwork = () => {

    const [playbackRate, setPlaybackRate] = useState(1);

    const handleSlowDown = () => {
        setPlaybackRate(playbackRate - 0.1)
    }

    const handleSpeedUp = () => {
        setPlaybackRate(playbackRate + 0.1)
    }

    useEffect(() => {
        const video = document.getElementById("video") as HTMLVideoElement | null;

        if (video) {
            video.playbackRate = playbackRate;
        }

    })

    return (
        <div className="m-auto text-center">
            <div className="size-auto">
                <Video id="video" controls>
                    <source src={"/theSocialNetwork/theSocialNetwork.mp4"} type="video/mp4" />
                </Video>
            </div>
            <div>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handleSlowDown()}>Slow Down</button>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => handleSpeedUp()}>Speed Up</button>
            </div>
        </div>
    )
}

export default TheSocialNetwork;