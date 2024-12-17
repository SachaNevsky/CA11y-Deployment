/**
 * Interface for the `PersonCard` props
 * @param {string} name - The name of the persona
 * @param {string[]} blurb - A list of persona characteristics
 * @param {string[]} challenges - A list of aphasia challenges experienced by the persona 
 */
interface PersonaCardProps {
    name: string;
    blurb: string[];
    challenges: string[];
}

/**
 * A React component for the persona card. 
 * @param {PersonaCardProps} props - The props for the `PersonaCard` component.
 * @param {string} props.name - The name of the persona
 * @param {string[]} props.blurb - A list of persona characteristics
 * @param {string[]} props.challenges - A list of aphasia challenges experienced by the persona 
 * @returns {JSX.Element} The rendered `PersonaCard` component
 * @example
 * <PersonaCard
 *     name={}
 *     blurb={}
 *     challenges={}
 * />
 */
const PersonaCard: React.FC<PersonaCardProps> = ({ name, blurb, challenges }: PersonaCardProps): JSX.Element => {

    return (
        <ul className="p-2 border rounded-md border-gray-300 list-none transition ease-in hover:border-gray-500 hover:bg-gray-300">
            <li key={name}>{name}</li>
            <br />
            {blurb.map((item, index) => (
                <li key={item + index}>{item}</li>
            ))}
            <br />
            {challenges.map((item, index) => (
                <li key={item + index}>{item}</li>
            ))}
        </ul>
    )
}

export default PersonaCard;