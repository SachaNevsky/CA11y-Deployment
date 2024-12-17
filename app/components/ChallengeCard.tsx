import Image from "next/image";

/**
 * Interface for the `ChallengeCard` props
 * @param {string} text - The text description of the challenge
 * @param {string} icon - A name of the icon that represents the challenge
 */
interface ChallengeCardProps {
    text: string;
    icon: string;
}

/**
 * A React component for the challenge card. 
 * @param {ChallengeCardProps} props - The props for the `ChallengeCard` component.
 * @param {string} props.text - The text description of the challenge
 * @param {string} props.icon - A name of the icon that represents the challenge
 * @returns {JSX.Element} The rendered `ChallengeCard` component
 * @example
 * <ChallengeCard
 *     text={}
 *     icon={}
 * />
 */
const ChallengeCard: React.FC<ChallengeCardProps> = ({ text, icon }: ChallengeCardProps): JSX.Element => {

    return (
        <ul className="p-2 border rounded-md border-gray-300 list-none transition ease-in hover:border-gray-500 hover:bg-gray-300">
            <li key={text}>{text}</li>
            <br />
            <Image
                src={`/challenges/${icon}`}
                alt={`An icon representing the concept of "${text}"`}
                width={"1000"}
                height={"0"}
            />
        </ul>
    )
}

export default ChallengeCard;