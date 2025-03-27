// ./app/api/EMAQuestions.ts
import { EMAQuestion } from "./types";

export const EMA_QUESTIONS: EMAQuestion[] = [
    {
        id: "volume",
        text: "<strong>How easy</strong> was it to <b>understand</b> the <b>speech</b>?",
        condition: "volume"
    },
    {
        id: "speed",
        text: "<strong>How easy</strong> was it to watch at <strong>this speed</strong>?",
        condition: "speed"
    },
    {
        id: "captions",
        text: "<strong>How easy</strong> was it to <stong>understand with</strong> the <strong>captions</strong>?",
        condition: "captions"
    },
    {
        id: "highlight",
        text: "<strong>How easy</strong> was it to <strong>follow</strong> the <strong>speakers</strong>?",
        condition: "highlight"
    },
    {
        id: "general",
        text: "<strong>How easy</strong> was your <strong>overall</strong> viewing <strong>experience</strong>?",
        condition: "general"
    }
];