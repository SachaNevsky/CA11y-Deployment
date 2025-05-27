"use client"

import { useEffect, useState } from "react";
import { logAction } from "@/lib/logAction";

const VideoLibrary = () => {
    const [name, setName] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedName = localStorage.getItem("ca11yDeploymentName");

            if (storedName) setName(storedName);
        }
    }, []);

	if(name === "") {
		return(
			<div>Loading...</div>
		)
	}

    const handleDelete = () => {
        const name = localStorage.getItem("ca11yDeploymentName")
        const settings = localStorage.getItem("ca11ySettings");

        if (name || settings) {
		logAction(name, "Deleted Ca11y name and settings.");
        	localStorage.removeItem("ca11yDeploymentName");
        	localStorage.removeItem("ca11ySettings");
        	window.open("/", "_self");
	}
    }

    return (
        <div className="m-auto w-[90%] text-center">
            <div>
                <button className="py-2 px-4 m-4 border-solid border-2 rounded-md border-gray-500" onClick={() => { handleDelete() }}>Delete locally stored data</button>
            </div>
        </div>
    )
}

export default VideoLibrary;
