"use client"

import VideoCard from "../components/VideoCard";

const VideoLibrary = () => {

    const videoNames = ["theSocialNetwork"];

    const handleVideoClick = (video: string): void => {
        window.open(`/videoLibrary/${video}`, "_self")
    }

    const handleDeleteCharacteristics = () => {
        localStorage.removeItem("ca11yAphasiaCharacteristics");
        window.open("/", "_self");
    }

    return (
        <div className="m-auto text-center">
            Video Library
            <div>
                <button className="py-2 px-4 m-1 border-solid border-2 rounded-md border-gray-500" onClick={() => { handleDeleteCharacteristics() }}>Delete aphasia characteristics</button>
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