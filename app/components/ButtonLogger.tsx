"use client";

import React, { ReactNode, useState } from "react";
import { logAction } from "@/lib/logger";

/**
 * A utility function that returns a debounced version of the provided function.
 * The returned function delays the execution of `fn` until after `wait` milliseconds have passed since the last time it was invoked.
 * 
 * @template T - The type of the function to debounce.
 * @param {T} fn - The function to debounce.
 * @param {number} wait - The number of milliseconds to wait before executing `fn`.
 * @returns {(...args: Parameters<T>) => void} - A debounced version of `fn`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, args);
        }, wait);
    };
}

/**
 * Interface for the logger
 * @param {string} action - The action being performed.
 * @param {string} user - The user performing the action.
 * @param {(event: React.MouseEvent | React.TouchEvent) => void} onClick - Optional callback function to handle onClick event.
 * @param {ReactNode} children - Element to be displayed inside the button.
 */
interface ButtonLoggerProps {
    action: string;
    user: string;
    onClick?: (event: React.MouseEvent | React.TouchEvent) => void;
    children: ReactNode;
}

/**
 * A React component for logging user button press.
 * The component ensures only one log is processed at a time, and logs the provided action and user data.
 * 
 * @param {ButtonLoggerProps} props - The props for the ButtonLogger component.
 * @param {string} props.action - The action to be logged.
 * @param {string} props.user - The user performing the action.
 * @param {(event: React.MouseEvent | React.TouchEvent) => void} [props.onClick] - Optional callback function to execute additional logic when the button is clicked.
 * @param {ReactNode} [props.children] - Content to render inside the button.
 * @returns {JSX.Element} The rendered ButtonLogger component.
 */
const ButtonLogger: React.FC<ButtonLoggerProps> = ({ action, user, onClick, children }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * Handler for the click or touch event.
     * 
     * @param {React.MouseEvent | React.TouchEvent} event - The event triggered by user interaction.
     */
    const handleEvent = debounce(async (event: React.MouseEvent | React.TouchEvent) => {
        event.stopPropagation();
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            if (action && user) {
                await logAction(action, user);
                alert("Action logged successfully");
            } else {
                console.warn("Action or user information is missing");
            }
        } catch (error) {
            console.error("Error logging action:", error);
        } finally {
            setIsProcessing(false);
        }

        if (onClick) {
            onClick(event);
        }
    }, 300);

    return (
        <button onClick={handleEvent} disabled={isProcessing}>
            {children || "Log Action"}
        </button>
    );
};

export default ButtonLogger;