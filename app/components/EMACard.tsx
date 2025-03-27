import React, { useState } from "react";
import parse from "html-react-parser";
import { EMAQuestion } from "../api/types";
import { logAction } from "@/lib/logAction";
import { logEMAResponse } from "@/lib/emaLogger";

interface EMACardProps {
    isOpen: boolean;
    onClose: () => void;
    question: EMAQuestion;
    userName: string;
}

const EMACard = ({ isOpen, onClose, question, userName }: EMACardProps): JSX.Element | null => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);

    if (!isOpen || !question) return null;

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
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setSelectedRating(rating)}
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-medium ${selectedRating === rating
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 hover:bg-gray-300"}`}
                        >
                            {rating}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between text-sm text-gray-600 px-2 mb-6">
                    <span>Very hard</span>
                    <span>Very easy</span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={selectedRating === null}
                    className={`w-full py-2 rounded-md ${selectedRating === null
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default EMACard;