import { EMAQuestion } from "./types";

export const EMA_QUESTIONS: EMAQuestion[] = [
    {
        id: "volume",
        text: "How satisfied were you with the audio levels during your viewing?",
        condition: "volume"
    },
    {
        id: "speed",
        text: "How comfortable were you with the playback speed?",
        condition: "speed"
    },
    {
        id: "captions",
        text: "How helpful did you find the captions?",
        condition: "captions"
    },
    {
        id: "highlight",
        text: "How useful was the spotlight feature for your understanding?",
        condition: "highlight"
    },
    {
        id: "general",
        text: "How was your overall video experience?",
        condition: "general"
    }
];