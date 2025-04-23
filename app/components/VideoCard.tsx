import Image from "next/image";

/**
 * Interface for the `InfoObject` props
 * @param {string} year - The year of the is from
 * @param {string} type - The type of video it is
 */
interface InfoObject {
    year: string;
    type: string;
}

/**
 * Interface for the `VideoCard` props
 * @param {string} name - The name of the video
 */
interface VideoCardProps {
    name: string;
    video: string;
    info: InfoObject;
}

/**
 * A React component for the video card. 
 * @param {VideoCardProps} props - The props for the `VideoCard` component.
 * @param {string} props.name - The title of the video
 * @param {string} props.video - The name of the video file
 * @returns {JSX.Element} The rendered `VideoCard` component
 * @example
 * <VideoCard
 *      name={}
 *      video={}
 *      info={}
 * />
 */
const VideoCard: React.FC<VideoCardProps> = ({ name, video, info }: VideoCardProps): JSX.Element => {

    return (
        <div className="border border-transparent list-none rounded-md hover:border hover:border-blue-500 hover:bg-blue-300">
            <Image src={`/${video}/${video}_thumbnail.jpg`} alt={`Thumbname for "${name}" video`} width={"1000"} height={"0"} className="p-1 m-auto rounded-md" />
            <p className="px-1 pt-2 font-bold text-xl text-left">{name} ({info.year})</p>
            <p className="px-1 pb-2 font-semibold text-md text-left">{info.type}</p>
        </div>
    )
}

export default VideoCard;