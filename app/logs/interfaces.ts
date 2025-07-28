export interface LogAction {
    action: string;
    timestamp: string;
}

export interface UserLog {
    _id: string;
    user: string;
    actions: LogAction[];
    createdAt: string;
    documentIndex: number;
}

export interface Session {
    startTime: Date;
    endTime: Date;
    actions: LogAction[];
    duration: string;
}

export interface GroupedLogs {
    [user: string]: Session[];
}