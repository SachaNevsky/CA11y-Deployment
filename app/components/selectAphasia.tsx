"use client"

import { useState } from "react"
import PersonaCard from "./PersonaCard";

/**
 * Interface for the `SelectAphasia` props
 * @param {string} name - The name of the user.
 */
interface SelectAphasiaProps {
    name: string
}

/**
 * A React component that allows the user to select whether they select a persona or choose aphasia characteristics. 
 * 
 * @param {SelectAphasiaProps} props - The props for the `SelectAphasia` component.
 * @param {string} props.name - The name of the user.
 * @returns {JSX.Element} The rendered `SelectAphasia` component
 * @example <SelectAphasia name={} />
 */
const SelectAphasia: React.FC<SelectAphasiaProps> = ({ name }: SelectAphasiaProps): JSX.Element => {
    const [choice, setChoice] = useState("");

    const handleSelect = (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>): void => {
        const target: HTMLButtonElement = event.target as HTMLButtonElement;
        console.log(target);
        setChoice(target.innerText);
    }

    const personas = [
        {
            name: "Annie",
            blurb: ["5 years post-stroke", "Struggles with technology", "Use if right hand is slow"],
            challenges: ["Struggles iwht reading and writing", "Someone reading out loud helps a lot"]
        },
        {
            name: "Jimmy",
            blurb: ["1 year post-stroke", "Cannot type on smartphone", "Can one use his left hand"],
            challenges: ["Finds writing harder than reading", "Can only use his left hand"]
        },
        {
            name: "John",
            blurb: ["2 year post-stroke", "No issues with technology", "Has limited use of right hand"],
            challenges: ["Finds remembering discussions difficult", "Struggles with speaking"]
        },
        {
            name: "Charlotte",
            blurb: ["15 year post-stroke", "No issues with technology", "Naturally left-handed"],
            challenges: ["Struggles with reading but not writing", "Finds understanding fast speech difficult"]
        }
    ]

    return (
        <div className="mx-[16%]">
            <h1>{name} chose {choice}</h1>
            <div className="">
                <button onClick={handleSelect} className="p-2 m-1 border-solid border-2 rounded-md border-gray-300">Personas</button>
                <button onClick={handleSelect} className="p-2 m-1 border-solid border-2 rounded-md border-gray-300">Apahsia Characteristics</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {choice === "Personas" ? (
                    personas.map((persona, index) => {
                        return (
                            <div
                                key={persona.name}
                                className="opacity-0 animate-fade-in"
                                style={{ animationDelay: `${index * 20}ms` }}
                            >
                                <PersonaCard
                                    name={persona.name}
                                    blurb={persona.blurb}
                                    challenges={persona.challenges}
                                />
                            </div>)
                    })
                ) : (
                    <div />
                )}
            </div>
        </div>
    )
}

export default SelectAphasia;