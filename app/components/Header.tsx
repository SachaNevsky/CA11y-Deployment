"use client"

import { useEffect, useState } from "react";
import LinkLogger from "./LinkLogger";

const Header: React.FC = () => {

    const [name, setName] = useState<string>("Name is missing");
    const [selectedAphasia, setSelectedAphasia] = useState<boolean>(false);

    useEffect(() => {
        const storedName = localStorage.getItem("ca11yDeploymentName");
        if (storedName) {
            setName(storedName);
        }
    }, [])

    useEffect(() => {
        const storedAphasia = localStorage.getItem("ca11yPersona") != null || localStorage.getItem("ca11yAphasiaCharacteristics") != null;
        if (storedAphasia) {
            setSelectedAphasia(storedAphasia)
        }
    }, [])


    return (
        <div className="py-4 px-6 text-2xl bg-gray-300 border-2 border-b-gray-500">
            <LinkLogger
                action="Press Home button"
                user={name}
                href={selectedAphasia ? "/videoLibrary" : "/"}
                text="Home 🏠" />
        </div>
    )
}

export default Header;