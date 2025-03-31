import React, { useState } from "react";
import parse from "html-react-parser";
import { EMAQuestion } from "../api/types";
import { logAction } from "@/lib/logAction";
import { logEMAResponse } from "@/lib/emaLogger";
import { ThumbsDown, ThumbsUp, Angry, Frown, Meh, Smile, Laugh } from "lucide-react";

interface EMACardProps {
    isOpen: boolean;
    onClose: () => void;
    question: EMAQuestion;
    userName: string;
}

const EMACard = ({ isOpen, onClose, question, userName }: EMACardProps): JSX.Element | null => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);

    if (!isOpen || !question) return null;

    const emotionIcons = {
        1: Angry,
        2: Frown,
        3: Meh,
        4: Smile,
        5: Laugh
    };

    const ratingColors = {
        1: "bg-red-400 hover:bg-red-500",
        2: "bg-orange-400 hover:bg-orange-500",
        3: "bg-yellow-400 hover:bg-yellow-500",
        4: "bg-lime-500 hover:bg-lime-600",
        5: "bg-green-500 hover:bg-green-600"
    };

    const handleEMALogging = async (value: number) => {
        if (typeof window !== 'undefined') {
            if (!userName) return;

            try {
                await logEMAResponse(userName, question.id, question.text, value);
                logAction(userName, `EMA Response: "${question.id}" - Rating: ${value}/5`);
            } catch (error) {
                console.error("Error submitting EMA response:", error);
            }
        }
    }

    const handleSubmit = () => {
        if (selectedRating !== null) {
            handleEMALogging(selectedRating);
            setSelectedRating(null);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-4">Quick Question</h2>
                <p className="mb-6 text-lg font-semibold">{parse(question.text)}</p>

                <div className="flex justify-between mb-6">
                    {[1, 2, 3, 4, 5].map((rating) => {
                        const IconComponent = emotionIcons[rating as keyof typeof emotionIcons];
                        const colorClass = ratingColors[rating as keyof typeof ratingColors];
                        return (
                            <button
                                key={rating}
                                onClick={() => setSelectedRating(rating)}
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium text-white ${selectedRating === rating ? `${colorClass} ring-4 ring-blue-700` : `${colorClass}`}`}>
                                <div className="flex flex-col items-center">
                                    <IconComponent className="h-[1.5em] w-[1.5em]" color="black" />
                                    {/* <span className="mt-1">{rating}</span> */}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-900 px-2 mb-6">
                    <div className="flex items-center">
                        <ThumbsDown strokeWidth={2.75} className="h-[1.5em] w-[1.5em]" />
                        <span className="ml-2">Very hard</span>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-2">Very easy</span>
                        <ThumbsUp strokeWidth={2.75} className="h-[1.5em] w-[1.5em]" />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={selectedRating === null}
                    className={`w-full py-2 rounded-md ${selectedRating === null ? "bg-gray-300 cursor-not-allowed" : "bg-blue-700 text-white hover:bg-blue-800"}`}>
                    Submit
                </button>
            </div>
        </div>
    );
};

export default EMACard;