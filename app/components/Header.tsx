"use client"

import { useEffect, useState } from "react";
import LinkLogger from "./LinkLogger";

const Header: React.FC = () => {

    const [name, setName] = useState<string>("Name is missing");

    useEffect(() => {
        const storedName = localStorage.getItem("ca11yDeploymentName");
        if (storedName) {
            setName(storedName);
        }
    }, [])


    return (
        <div className="py-4 px-6 text-2xl bg-gray-300 border-2 border-b-gray-500">
            <LinkLogger
                action="Press Home button"
                user={name}
                href="/"
                text="Home 🏠" />
        </div>
    )
}

export default Header;