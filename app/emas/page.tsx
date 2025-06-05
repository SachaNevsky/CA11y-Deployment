// ./app/emas/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

interface EMAResponse {
    questionId: string;
    question: string;
    response: number;
    timestamp: string;
}

interface UserEMA {
    _id: string;
    user: string;
    responses: EMAResponse[];
    createdAt: string;
}

interface ChartDataPoint {
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

interface EMASession {
    startTime: Date;
    endTime: Date;
    responses: EMAResponse[];
    duration: string;
}

interface GroupedEMAs {
    [user: string]: EMASession[];
}

type QuestionType = 'general' | 'speed' | 'volume' | 'captions' | 'highlight';

export default function EMAPage() {
    const [emas, setEmas] = useState<UserEMA[]>([]);
    const [groupedEMAs, setGroupedEMAs] = useState<GroupedEMAs>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [excludeFirstSession, setExcludeFirstSession] = useState(false);

    useEffect(() => {
        fetchEMAs();
    }, []);

    const fetchEMAs = async () => {
        try {
            const response = await fetch('/api/emas');
            if (!response.ok) {
                throw new Error('Failed to fetch EMAs');
            }
            const data = await response.json();
            setEmas(data);
            console.log(emas)
            processEMAs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const processEMAs = (emasData: UserEMA[]) => {
        const grouped: GroupedEMAs = {};
        const SESSION_GAP_MS = 30 * 60 * 1000; // 30 minutes

        emasData.forEach(ema => {
            if (!grouped[ema.user]) {
                grouped[ema.user] = [];
            }

            const sortedResponses = [...ema.responses].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            let currentSession: EMASession | null = null;

            sortedResponses.forEach(response => {
                const responseTime = new Date(response.timestamp);

                if (!currentSession ||
                    (responseTime.getTime() - currentSession.endTime.getTime()) > SESSION_GAP_MS) {
                    if (currentSession) {
                        grouped[ema.user].push(currentSession);
                    }
                    currentSession = {
                        startTime: responseTime,
                        endTime: responseTime,
                        responses: [response],
                        duration: '0 minutes'
                    };
                } else {
                    currentSession.responses.push(response);
                    currentSession.endTime = responseTime;
                }
            });

            if (currentSession) {
                grouped[ema.user].push(currentSession);
            }
        });

        // Calculate durations and sort sessions
        Object.keys(grouped).forEach(user => {
            grouped[user].forEach(session => {
                const durationMs = session.endTime.getTime() - session.startTime.getTime();
                const minutes = Math.round(durationMs / (1000 * 60));
                session.duration = minutes === 0 ? 'Less than 1 minute' : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            });

            grouped[user].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        });

        setGroupedEMAs(grouped);
    };

    const getQuestionType = (questionId: string, question: string): QuestionType => {
        const lowerQuestion = question.toLowerCase();
        const lowerQuestionId = questionId.toLowerCase();

        if (lowerQuestion.includes('speed') || lowerQuestionId.includes('speed')) {
            return 'speed';
        } else if (lowerQuestion.includes('volume') || lowerQuestionId.includes('volume')) {
            return 'volume';
        } else if (lowerQuestion.includes('caption') || lowerQuestionId.includes('caption')) {
            return 'captions';
        } else if (lowerQuestion.includes('highlight') || lowerQuestionId.includes('highlight')) {
            return 'highlight';
        }
        return 'general';
    };

    const processChartData = React.useCallback(() => {
        if (!selectedUser || !groupedEMAs[selectedUser]) {
            setChartData([]);
            return;
        }

        const userSessions = groupedEMAs[selectedUser];
        const sessionsToInclude = excludeFirstSession && userSessions.length > 1
            ? userSessions.slice(1)
            : userSessions;

        const allResponses: EMAResponse[] = [];

        sessionsToInclude.forEach(session => {
            session.responses.forEach(response => {
                allResponses.push(response);
            });
        });

        // Sort by timestamp
        allResponses.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const chartPoints: ChartDataPoint[] = [];
        let globalIndex = 1;

        // Create data points for all responses
        allResponses.forEach((response) => {
            const type = getQuestionType(response.questionId, response.question);

            const dataPoint: ChartDataPoint = {
                index: globalIndex,
                timestamp: response.timestamp,
                questionType: type,
            };

            // Set the appropriate field based on question type
            switch (type) {
                case 'general':
                    dataPoint.general = response.response;
                    break;
                case 'speed':
                    dataPoint.speed = response.response;
                    break;
                case 'volume':
                    dataPoint.volume = response.response;
                    break;
                case 'captions':
                    dataPoint.captions = response.response;
                    break;
                case 'highlight':
                    dataPoint.highlight = response.response;
                    break;
            }

            chartPoints.push(dataPoint);
            globalIndex++;
        });

        // Calculate single best fit line for all points
        if (chartPoints.length > 1) {
            const allPointsForRegression: { x: number; y: number }[] = [];

            chartPoints.forEach(point => {
                const value = point.general ?? point.speed ?? point.volume ?? point.captions ?? point.highlight;
                if (value !== undefined) {
                    allPointsForRegression.push({ x: point.index, y: value });
                }
            });

            if (allPointsForRegression.length > 1) {
                const n = allPointsForRegression.length;
                const sumX = allPointsForRegression.reduce((sum, point) => sum + point.x, 0);
                const sumY = allPointsForRegression.reduce((sum, point) => sum + point.y, 0);
                const sumXY = allPointsForRegression.reduce((sum, point) => sum + point.x * point.y, 0);
                const sumXX = allPointsForRegression.reduce((sum, point) => sum + point.x * point.x, 0);

                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;

                // Add best fit values to all chart points
                chartPoints.forEach(point => {
                    point.bestfit = slope * point.index + intercept;
                });
            }
        }

        setChartData(chartPoints);
    }, [groupedEMAs, selectedUser, excludeFirstSession]);

    useEffect(() => {
        processChartData();
    }, [processChartData]);

    const formatDateTime = (date: Date) => {
        return date.toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Europe/London'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Europe/London'
        });
    };

    const getUsers = () => {
        return Object.keys(groupedEMAs);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading EMAs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">EMA Responses</h1>
                    <p className="text-gray-600 mb-4">
                        EMA responses over time (Sessions are grouped when responses occur within 30 minutes of each other)
                    </p>
                    <div className="mb-6">
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Select User:
                        </label>
                        <select
                            id="user-select"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a user</option>
                            {getUsers().map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Chart Section */}
                {selectedUser && groupedEMAs[selectedUser] && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">EMA Scores Over Time</h2>
                            {groupedEMAs[selectedUser].length > 1 && (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="exclude-first-session"
                                        checked={excludeFirstSession}
                                        onChange={(e) => setExcludeFirstSession(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="exclude-first-session" className="text-sm font-medium text-gray-700">
                                        Exclude first session from chart
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="index"
                                        label={{ value: 'Response Index', position: 'insideBottom', offset: -10 }}
                                    />
                                    <YAxis
                                        domain={[1, 5]}
                                        label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: "2%" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="general"
                                        stroke="#000000"
                                        strokeWidth={0}
                                        dot={{ fill: '#000000', strokeWidth: 2, r: 4 }}
                                        connectNulls={false}
                                        name="General"
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="speed"
                                        stroke="#22c55e"
                                        strokeWidth={0}
                                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                        connectNulls={false}
                                        name="Speed"
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="volume"
                                        stroke="#3b82f6"
                                        strokeWidth={0}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        connectNulls={false}
                                        name="Volume"
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="captions"
                                        stroke="#a855f7"
                                        strokeWidth={0}
                                        dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                                        connectNulls={false}
                                        name="Captions"
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="highlight"
                                        stroke="#eab308"
                                        strokeWidth={0}
                                        dot={{ fill: '#eab308', strokeWidth: 2, r: 4 }}
                                        connectNulls={false}
                                        name="Highlight"
                                        isAnimationActive={false}
                                    />
                                    {/* Single best fit line for all points */}
                                    <Line
                                        type="monotone"
                                        dataKey="bestfit"
                                        stroke="#dc2626"
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls={true}
                                        name="Best Fit (All Points)"
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* EMA Logs Section */}
                {Object.keys(groupedEMAs).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">No EMAs found</div>
                    </div>
                ) : selectedUser ? (
                    <div className="space-y-8">
                        {groupedEMAs[selectedUser] && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {selectedUser}
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {groupedEMAs[selectedUser].length} session{groupedEMAs[selectedUser].length !== 1 ? 's' : ''} recorded
                                    </p>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-6">
                                        {groupedEMAs[selectedUser].map((session, sessionIndex) => (
                                            <div key={sessionIndex} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            Session {sessionIndex + 1}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {formatDateTime(session.startTime)} to {formatDateTime(session.endTime).slice(-8)}
                                                        </div>
                                                        <div className="text-sm text-gray-400 text-right">
                                                            {session.responses.length} response{session.responses.length !== 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Duration: {session.duration}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {session.responses
                                                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                        .map((response, responseIndex) => {
                                                            const questionType = getQuestionType(response.questionId, response.question);
                                                            const typeColors: Record<QuestionType, string> = {
                                                                general: 'bg-gray-100 text-gray-800',
                                                                speed: 'bg-green-100 text-green-800',
                                                                volume: 'bg-blue-100 text-blue-800',
                                                                captions: 'bg-purple-100 text-purple-800',
                                                                highlight: 'bg-yellow-100 text-yellow-800'
                                                            };

                                                            return (
                                                                <div key={responseIndex} className="flex items-start space-x-3 py-2">
                                                                    <div className="flex-shrink-0 py-2 w-16 text-xs text-gray-500 font-mono mt-0.5">
                                                                        {formatTime(new Date(response.timestamp))}
                                                                    </div>
                                                                    <div className="flex-1 text-sm text-gray-700 bg-white px-3 py-2 rounded border">
                                                                        <div className="flex items-center">
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className={`px-2 py-1 rounded text-xs font-medium ${typeColors[questionType]}`}>
                                                                                    {questionType.charAt(0).toUpperCase() + questionType.slice(1)}
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-lg font-semibold text-gray-900 pl-4">
                                                                                {response.response}/5
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">Please select a user to view their EMA data</div>
                    </div>
                )}
            </div>
        </div>
    );
}