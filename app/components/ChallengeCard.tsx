import Image from "next/image";

/**
 * Interface for the `ChallengeCard` props
 * @param {string} text - The text description of the challenge
 * @param {string} icon - A name of the icon that represents the challenge
 * @param {boolean} isSelected - Whether the challenge is selected
 */
interface ChallengeCardProps {
    text: string;
    icon: string;
    isSelected?: boolean;
}

/**
 * A React component for the challenge card. 
 * @param {ChallengeCardProps} props - The props for the `ChallengeCard` component.
 * @param {string} props.text - The text description of the challenge
 * @param {string} props.icon - A name of the icon that represents the challenge
 * @param {boolean} props.isSelected - Whether the challenge is selected
 * @returns {JSX.Element} The rendered `ChallengeCard` component
 * @example
 * <ChallengeCard
 *     text={}
 *     icon={}
 *     isSelected={}
 * />
 */
const ChallengeCard: React.FC<ChallengeCardProps> = ({
    text,
    icon,
    isSelected = false
}: ChallengeCardProps): JSX.Element => {

    return (
        <ul className={`p-2 border rounded-md list-none ${isSelected ? 'border-blue-500 bg-blue-100 border-2' : 'border-gray-300'}`}>
            <li key={text}>{text}</li>
            <br />
            {icon && (
                <Image
                    src={`/challenges/${icon}`}
                    alt={`An icon representing the concept of "${text}"`}
                    width={"1000"}
                    height={"0"}
                />
            )}
        </ul>
    );
};

export default ChallengeCard;