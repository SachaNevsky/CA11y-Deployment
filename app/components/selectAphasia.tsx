"use client"

import { useState } from "react"

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
        console.log(target)
        setChoice(target.innerText)
    }

    return (
        <div>
            <h1>{name} chose {choice}</h1>
            <div className="">
                <button onClick={handleSelect} className="p-2 m-1 border-solid border-2 rounded-md border-gray-300">Personas</button>
                <button onClick={handleSelect} className="p-2 m-1 border-solid border-2 rounded-md border-gray-300">Apahsia Characteristics</button>
            </div>
        </div>
    )
}

export default SelectAphasia;