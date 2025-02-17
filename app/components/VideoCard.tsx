/**
 * Interface for the `VideoCard` props
 * @param {string} name - The name of the video
 */
interface VideoCardProps {
    name: string;
}

/**
 * A React component for the video card. 
 * @param {VideoCardProps} props - The props for the `VideoCard` component.
 * @param {string} props.name - The name of the video
 * @returns {JSX.Element} The rendered `VideoCard` component
 * @example
 * <VideoCard
 *     name={}
 * />
 */
const VideoCard: React.FC<VideoCardProps> = ({ name }: VideoCardProps): JSX.Element => {

    return (
        <ul className="p-2 border rounded-md border-gray-300 list-none transition ease-in hover:border-gray-500 hover:bg-gray-300">
            <li key={name}>{name}</li>
        </ul>
    )
}

export default VideoCard;