interface PersonaCardProps {
    name: string;
    blurb: string[];
    challenges: string[];
}

const PersonaCard: React.FC<PersonaCardProps> = ({ name, blurb, challenges }: PersonaCardProps): JSX.Element => {

    return (
        <ul className="p-2 border rounded-md border-gray-300 list-none transition ease-in delay-500">
            <h1>{name}</h1>
            {blurb.map((item, index) => (
                <li key={item + index}>{item}</li>
            ))}
            {challenges.map((item, index) => (
                <li key={item + index}>{item}</li>
            ))}
        </ul>
    )
}

export default PersonaCard;