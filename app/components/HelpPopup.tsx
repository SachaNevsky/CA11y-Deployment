// .app/components/HelpPopup.tsx
import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface HelpPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    imageSrc?: string;
}

const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose, title, content, imageSrc }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl z-50 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-4">
                    <p>{content}</p>
                </div>
                {imageSrc && (
                    <div className="mb-4">
                        <Image src={imageSrc} alt="Help illustration" className="w-full rounded-md" />
                    </div>
                )}
            </div>
        </>
    );
};

export default HelpPopup;