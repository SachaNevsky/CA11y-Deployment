import { EMAQuestion } from "../api/types";

export const getEMAQuestion = (emaQuestions: EMAQuestion[], actionCategory: string): EMAQuestion => {
    const matchingQuestions = emaQuestions.filter(q => q.condition === actionCategory);
    if (matchingQuestions.length > 0) {
        return matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
    }

    return emaQuestions.find(q => q.condition === "general") || emaQuestions[0];
};