export type QuestionType = 'general' | 'speed' | 'volume' | 'captions' | 'highlight';
export type ChartMode = 'sessions' | 'individual';

export interface EMAResponse {
    questionId: string;
    question: string;
    response: number;
    timestamp: string;
}

export interface UserEMA {
    _id: string;
    user: string;
    responses: EMAResponse[];
    createdAt: string;
}

export interface ChartDataPoint {
    index: number;
    general?: number;
    speed?: number;
    volume?: number;
    captions?: number;
    highlight?: number;
    bestfit?: number;
    timestamp: string;
    questionType?: QuestionType;
}

export interface AllUsersChartDataPoint {
    index: number;
    label: string;
    count: number;
    [key: string]: number | string;
}

export interface EMASession {
    startTime: Date;
    endTime: Date;
    responses: EMAResponse[];
    duration: string;
}

export interface GroupedEMAs {
    [user: string]: EMASession[];
}

export interface IndividualScoreDataPoint {
    index: number;
    user?: string;
    score: number;
    timestamp: string;
    questionType: QuestionType;
    [key: string]: number | string | undefined;
}
