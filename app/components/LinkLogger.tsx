"use client"

import { logAction } from "@/lib/logger";

/**
 * Interface for the logger
 * @param {string} action - The action being performed.
 * @param {string} user - The user performing the action.
 * @param {string} href - The href to which the link points.
 * @param {string} text - The textual description of the logged event.
 */
interface LinkLoggerProps {
    action: string;
    user: string;
    href: string;
    text: string;
}

/**
 * A React component for logging user link presses. Both logs the press and follows the link.
 * 
 * @param {LinkLoggerProps} props = The props for the LinkLogger component.
 * @param {string} props.action - The action being performed.
 * @param {string} props.user - The user performing the action.
 * @param {string} props.href - The href to which the link points.
 * @param {string} props.text - The textual description of the logged event.
 * @returns {JSX.Element} The rendered LinkLogger component - `<a/>`
 */
const LinkLogger: React.FC<LinkLoggerProps> = ({ action, user, href, text }: LinkLoggerProps): JSX.Element => {
    const handleEvent = async (event: React.MouseEvent | React.TouchEvent) => {
        event?.stopPropagation();
        try {
            await logAction(action, user);
        } catch (error) {
            console.error("Error logging action:", error);
        }
    }

    return (
        <a onClick={handleEvent} href={href}>{text}</a>
    )
}

export default LinkLogger;