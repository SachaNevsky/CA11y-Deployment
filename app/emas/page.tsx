// ./app/emas/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { EMAResponse, UserEMA, ChartDataPoint, AllUsersChartDataPoint, EMASession, GroupedEMAs, QuestionType, IndividualScoreDataPoint, ChartMode } from './interfaces';

export default function EMAPage() {
    const [emas, setEmas] = useState<UserEMA[]>([]);
    const [groupedEMAs, setGroupedEMAs] = useState<GroupedEMAs>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [allUsersChartData, setAllUsersChartData] = useState<AllUsersChartDataPoint[]>([]);
    const [individualScoreData, setIndividualScoreData] = useState<IndividualScoreDataPoint[]>([]);
    const [excludeFirstSession, setExcludeFirstSession] = useState(false);
    const [showOverallBestFit, setShowOverallBestFit] = useState(false);
    const [normalizeData, setNormalizeData] = useState(false);
    const [normalizationMethod, setNormalizationMethod] = useState<'session' | 'quartiles'>('session');
    const [chartMode, setChartMode] = useState<ChartMode>('sessions');
    const [showIndividualBestFit, setShowIndividualBestFit] = useState(false);

    const userColors = [
        '#22c55e', // green
        '#3b82f6', // blue
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // violet
        '#06b6d4', // cyan
        '#f97316', // orange
        '#84cc16', // lime
        '#ec4899', // pink
        '#6366f1', // indigo
    ];

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
        const SESSION_GAP_MS = 60 * 60 * 1000;

        emasData.forEach(ema => {
            if (!grouped[ema.user]) grouped[ema.user] = [];

            const sortedResponses = [...ema.responses].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            let currentSession: EMASession | null = null;

            sortedResponses.forEach(response => {
                const responseTime = new Date(response.timestamp);

                if (!currentSession ||
                    (responseTime.getTime() - currentSession.endTime.getTime()) > SESSION_GAP_MS) {
                    if (currentSession) grouped[ema.user].push(currentSession);
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

            if (currentSession) grouped[ema.user].push(currentSession);
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

    const processIndividualScoreData = React.useCallback(() => {
        if (Object.keys(groupedEMAs).length === 0) {
            setIndividualScoreData([]);
            return;
        }

        const users = Object.keys(groupedEMAs);
        const allIndividualScores: IndividualScoreDataPoint[] = [];

        if (selectedUser === 'all-users') {
            // Process all users
            users.forEach(user => {
                const userSessions = groupedEMAs[user];
                const sessionsToInclude = excludeFirstSession && userSessions.length > 1 ? userSessions.slice(1) : userSessions;

                const allUserResponses: EMAResponse[] = [];
                sessionsToInclude.forEach(session => {
                    session.responses.forEach(response => {
                        allUserResponses.push(response);
                    });
                });

                allUserResponses.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                allUserResponses.forEach((response, index) => {
                    const questionType = getQuestionType(response.questionId, response.question);
                    const dataPoint: IndividualScoreDataPoint = {
                        index: index + 1,
                        user,
                        score: response.response,
                        timestamp: response.timestamp,
                        questionType,
                        [user]: response.response
                    };
                    allIndividualScores.push(dataPoint);
                });
            });

            // Add best fit line if enabled
            if (showIndividualBestFit && allIndividualScores.length > 1) {
                // Calculate overall best fit across all users
                const allPointsForRegression: { x: number; y: number }[] = [];
                allIndividualScores.forEach(point => {
                    allPointsForRegression.push({ x: point.index, y: point.score });
                });

                if (allPointsForRegression.length > 1) {
                    const n = allPointsForRegression.length;
                    const sumX = allPointsForRegression.reduce((sum, point) => sum + point.x, 0);
                    const sumY = allPointsForRegression.reduce((sum, point) => sum + point.y, 0);
                    const sumXY = allPointsForRegression.reduce((sum, point) => sum + point.x * point.y, 0);
                    const sumXX = allPointsForRegression.reduce((sum, point) => sum + point.x * point.x, 0);

                    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    const intercept = (sumY - slope * sumX) / n;

                    // Add best fit values to each point
                    allIndividualScores.forEach(point => {
                        point.overall_bestfit = slope * point.index + intercept;
                    });
                }
            }
        } else if (selectedUser && groupedEMAs[selectedUser]) {
            // Process single user
            const userSessions = groupedEMAs[selectedUser];
            const sessionsToInclude = excludeFirstSession && userSessions.length > 1
                ? userSessions.slice(1)
                : userSessions;

            const allUserResponses: EMAResponse[] = [];
            sessionsToInclude.forEach(session => {
                session.responses.forEach(response => {
                    allUserResponses.push(response);
                });
            });

            allUserResponses.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            allUserResponses.forEach((response, index) => {
                const questionType = getQuestionType(response.questionId, response.question);
                const dataPoint: IndividualScoreDataPoint = {
                    index: index + 1,
                    score: response.response,
                    timestamp: response.timestamp,
                    questionType
                };
                allIndividualScores.push(dataPoint);
            });

            // Add best fit line for single user if enabled
            if (showIndividualBestFit && allIndividualScores.length > 1) {
                const allPointsForRegression: { x: number; y: number }[] = [];
                allIndividualScores.forEach(point => {
                    allPointsForRegression.push({ x: point.index, y: point.score });
                });

                if (allPointsForRegression.length > 1) {
                    const n = allPointsForRegression.length;
                    const sumX = allPointsForRegression.reduce((sum, point) => sum + point.x, 0);
                    const sumY = allPointsForRegression.reduce((sum, point) => sum + point.y, 0);
                    const sumXY = allPointsForRegression.reduce((sum, point) => sum + point.x * point.y, 0);
                    const sumXX = allPointsForRegression.reduce((sum, point) => sum + point.x * point.x, 0);

                    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    const intercept = (sumY - slope * sumX) / n;

                    allIndividualScores.forEach(point => {
                        point.bestfit = slope * point.index + intercept;
                    });
                }
            }
        }

        setIndividualScoreData(allIndividualScores);
    }, [groupedEMAs, selectedUser, excludeFirstSession, showIndividualBestFit]);

    const processAllUsersChartData = React.useCallback(() => {
        if (Object.keys(groupedEMAs).length === 0) {
            setAllUsersChartData([]);
            return;
        }

        const users = Object.keys(groupedEMAs);
        const userData: { [user: string]: { [key: string]: { scores: number[]; count: number } } } = {};

        users.forEach(user => {
            userData[user] = {};
        });

        users.forEach(user => {
            const userSessions = groupedEMAs[user];
            const sessionsToInclude = excludeFirstSession && userSessions.length > 1 ? userSessions.slice(1) : userSessions;

            sessionsToInclude.forEach((session, sessionIndex) => {
                const sessionKey = `${sessionIndex + (excludeFirstSession && userSessions.length > 1 ? 2 : 1)}`;
                const sessionScores = session.responses.map(r => r.response);
                const averageScore = sessionScores.reduce((sum, score) => sum + score, 0) / sessionScores.length;

                if (!userData[user][sessionKey]) userData[user][sessionKey] = { scores: [], count: 0 };

                userData[user][sessionKey].scores.push(averageScore);
                userData[user][sessionKey].count += sessionScores.length;
            });
        });

        if (normalizeData) {
            const maxSessions = Math.max(...users.map(user => Object.keys(userData[user]).length));

            if (maxSessions <= 1) {
                setNormalizeData(false);
                return;
            }

            const normalizedChartPoints: AllUsersChartDataPoint[] = [];

            if (normalizationMethod === 'session') {
                for (let i = 1; i <= maxSessions; i++) {
                    const dataPoint: AllUsersChartDataPoint = {
                        index: i,
                        label: `Session ${i}`,
                        count: 1
                    };

                    users.forEach(user => {
                        const userSessions = Object.keys(userData[user]).sort((a, b) => parseInt(a) - parseInt(b));
                        const userSessionCount = userSessions.length;

                        if (userSessionCount === 0) {
                            return;
                        } else if (userSessionCount === 1) {
                            const sessionKey = userSessions[0];
                            const userScores = userData[user][sessionKey].scores;
                            const averageScore = userScores.reduce((sum, score) => sum + score, 0) / userScores.length;
                            dataPoint[user] = Math.round(averageScore * 100) / 100;
                            dataPoint[`${user}_count`] = userData[user][sessionKey].count;
                        } else {
                            const normalizedPosition = (i - 1) / (maxSessions - 1) * (userSessionCount - 1);
                            const lowerIndex = Math.floor(normalizedPosition);
                            const upperIndex = Math.ceil(normalizedPosition);

                            const lowerSessionKey = userSessions[lowerIndex];
                            const upperSessionKey = userSessions[upperIndex];

                            const lowerScores = userData[user][lowerSessionKey].scores;
                            const upperScores = userData[user][upperSessionKey].scores;

                            const lowerAverage = lowerScores.reduce((sum, score) => sum + score, 0) / lowerScores.length;
                            const upperAverage = upperScores.reduce((sum, score) => sum + score, 0) / upperScores.length;

                            let interpolatedValue: number;
                            if (lowerIndex === upperIndex) {
                                interpolatedValue = lowerAverage;
                            } else {
                                const weight = normalizedPosition - lowerIndex;
                                interpolatedValue = lowerAverage * (1 - weight) + upperAverage * weight;
                            }

                            dataPoint[user] = Math.round(interpolatedValue * 100) / 100;

                            const lowerCount = userData[user][lowerSessionKey].count;
                            const upperCount = userData[user][upperSessionKey].count;
                            const interpolatedCount = lowerIndex === upperIndex ? lowerCount : Math.round(lowerCount * (1 - (normalizedPosition - lowerIndex)) + upperCount * (normalizedPosition - lowerIndex));
                            dataPoint[`${user}_count`] = interpolatedCount;
                        }
                    });

                    normalizedChartPoints.push(dataPoint);
                }
            } else if (normalizationMethod === 'quartiles') {
                const quartilePoints = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
                const quartileLabels = ['0%', '10%', "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"];

                quartilePoints.forEach((quartile, index) => {
                    const dataPoint: AllUsersChartDataPoint = {
                        index: index + 1,
                        label: quartileLabels[index],
                        count: 1
                    };

                    users.forEach(user => {
                        const userSessions = Object.keys(userData[user]).sort((a, b) => parseInt(a) - parseInt(b));
                        const userSessionCount = userSessions.length;

                        if (userSessionCount === 0) {
                            return;
                        } else if (userSessionCount === 1) {
                            const sessionKey = userSessions[0];
                            const userScores = userData[user][sessionKey].scores;
                            const averageScore = userScores.reduce((sum, score) => sum + score, 0) / userScores.length;
                            dataPoint[user] = Math.round(averageScore * 100) / 100;
                            dataPoint[`${user}_count`] = userData[user][sessionKey].count;
                        } else {
                            const normalizedPosition = quartile * (userSessionCount - 1);
                            const lowerIndex = Math.floor(normalizedPosition);
                            const upperIndex = Math.ceil(normalizedPosition);

                            const lowerSessionKey = userSessions[lowerIndex];
                            const upperSessionKey = userSessions[upperIndex];

                            const lowerScores = userData[user][lowerSessionKey].scores;
                            const upperScores = userData[user][upperSessionKey].scores;

                            const lowerAverage = lowerScores.reduce((sum, score) => sum + score, 0) / lowerScores.length;
                            const upperAverage = upperScores.reduce((sum, score) => sum + score, 0) / upperScores.length;

                            let interpolatedValue: number;
                            if (lowerIndex === upperIndex) {
                                interpolatedValue = lowerAverage;
                            } else {
                                const weight = normalizedPosition - lowerIndex;
                                interpolatedValue = lowerAverage * (1 - weight) + upperAverage * weight;
                            }

                            dataPoint[user] = Math.round(interpolatedValue * 100) / 100;

                            const lowerCount = userData[user][lowerSessionKey].count;
                            const upperCount = userData[user][upperSessionKey].count;
                            const interpolatedCount = lowerIndex === upperIndex ? lowerCount :
                                Math.round(lowerCount * (1 - (normalizedPosition - lowerIndex)) + upperCount * (normalizedPosition - lowerIndex));
                            dataPoint[`${user}_count`] = interpolatedCount;
                        }
                    });

                    normalizedChartPoints.push(dataPoint);
                });
            }

            if (showOverallBestFit) {
                const allPointsForOverallRegression: { x: number; y: number }[] = [];
                users.forEach(user => {
                    normalizedChartPoints.forEach(point => {
                        if (point[user] !== undefined) {
                            allPointsForOverallRegression.push({ x: point.index, y: point[user] as number });
                        }
                    });
                });

                if (allPointsForOverallRegression.length > 1) {
                    const n = allPointsForOverallRegression.length;
                    const sumX = allPointsForOverallRegression.reduce((sum, point) => sum + point.x, 0);
                    const sumY = allPointsForOverallRegression.reduce((sum, point) => sum + point.y, 0);
                    const sumXY = allPointsForOverallRegression.reduce((sum, point) => sum + point.x * point.y, 0);
                    const sumXX = allPointsForOverallRegression.reduce((sum, point) => sum + point.x * point.x, 0);

                    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    const intercept = (sumY - slope * sumX) / n;

                    normalizedChartPoints.forEach(point => {
                        point.overall_bestfit = slope * point.index + intercept;
                    });
                }
            }

            setAllUsersChartData(normalizedChartPoints);
            return;
        }

        const allTimePeriods = new Set<string>();
        users.forEach(user => {
            Object.keys(userData[user]).forEach(period => {
                allTimePeriods.add(period);
            });
        });

        const sortedTimePeriods = Array.from(allTimePeriods).sort((a, b) => {
            const aNum = parseInt(a.split(' ')[1]);
            const bNum = parseInt(b.split(' ')[1]);
            return aNum - bNum;
        });

        const chartPoints: AllUsersChartDataPoint[] = sortedTimePeriods.map((period, index) => {
            const dataPoint: AllUsersChartDataPoint = {
                index: index + 1,
                label: period,
                count: 1
            };

            users.forEach(user => {
                if (userData[user][period] && userData[user][period].scores.length > 0) {
                    const userScores = userData[user][period].scores;
                    const averageScore = userScores.reduce((sum, score) => sum + score, 0) / userScores.length;
                    dataPoint[user] = Math.round(averageScore * 100) / 100;
                    dataPoint[`${user}_count`] = userData[user][period].count;
                }
            });

            return dataPoint;
        });

        if (showOverallBestFit) {
            const allPointsForOverallRegression: { x: number; y: number }[] = [];
            if (showOverallBestFit) {
                users.forEach(user => {
                    chartPoints.forEach(point => {
                        if (point[user] !== undefined) {
                            allPointsForOverallRegression.push({ x: point.index, y: point[user] as number });
                        }
                    });
                });
            }

            if (showOverallBestFit && allPointsForOverallRegression.length > 1) {
                const n = allPointsForOverallRegression.length;
                const sumX = allPointsForOverallRegression.reduce((sum, point) => sum + point.x, 0);
                const sumY = allPointsForOverallRegression.reduce((sum, point) => sum + point.y, 0);
                const sumXY = allPointsForOverallRegression.reduce((sum, point) => sum + point.x * point.y, 0);
                const sumXX = allPointsForOverallRegression.reduce((sum, point) => sum + point.x * point.x, 0);

                const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                const intercept = (sumY - slope * sumX) / n;

                chartPoints.forEach(point => {
                    point.overall_bestfit = slope * point.index + intercept;
                });
            }
        }

        setAllUsersChartData(chartPoints);
    }, [groupedEMAs, excludeFirstSession, showOverallBestFit, normalizeData, normalizationMethod]);

    const processChartData = React.useCallback(() => {
        if (!selectedUser || !groupedEMAs[selectedUser]) {
            setChartData([]);
            return;
        }

        const userSessions = groupedEMAs[selectedUser];
        const sessionsToInclude = excludeFirstSession && userSessions.length > 1 ? userSessions.slice(1) : userSessions;

        const allResponses: EMAResponse[] = [];

        sessionsToInclude.forEach(session => {
            session.responses.forEach(response => {
                allResponses.push(response);
            });
        });

        allResponses.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const chartPoints: ChartDataPoint[] = [];
        let globalIndex = 1;

        allResponses.forEach((response) => {
            const type = getQuestionType(response.questionId, response.question);

            const dataPoint: ChartDataPoint = {
                index: globalIndex,
                timestamp: response.timestamp,
                questionType: type,
            };

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

                chartPoints.forEach(point => {
                    point.bestfit = slope * point.index + intercept;
                });
            }
        }

        setChartData(chartPoints);
    }, [groupedEMAs, selectedUser, excludeFirstSession]);

    useEffect(() => {
        if (selectedUser === 'all-users') {
            if (chartMode === 'sessions') {
                processAllUsersChartData();
            } else {
                processIndividualScoreData();
            }
        } else {
            if (chartMode === 'sessions') {
                processChartData();
            } else {
                processIndividualScoreData();
            }
        }
    }, [processChartData, processAllUsersChartData, processIndividualScoreData, selectedUser, chartMode]);

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

    const getUserColor = (user: string, index: number) => {
        return userColors[index % userColors.length];
    };

    const renderIndividualScoresChart = () => {
        if (selectedUser === 'all-users') {
            const users = getUsers();
            const maxDataPoints = Math.max(...users.map(user =>
                individualScoreData.filter(point => point.user === user).length
            ));

            const consolidatedData: { index: number;[key: string]: number | string | undefined }[] = [];
            for (let i = 1; i <= maxDataPoints; i++) {
                const dataPoint: { index: number;[key: string]: number | string | undefined } = { index: i };
                users.forEach(user => {
                    const userPoint = individualScoreData.find(point => point.user === user && point.index === i);
                    if (userPoint) {
                        dataPoint[user] = userPoint.score;
                        if (userPoint.overall_bestfit !== undefined) dataPoint.overall_bestfit = userPoint.overall_bestfit;
                    }
                });
                consolidatedData.push(dataPoint);
            }

            return (
                <LineChart data={consolidatedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="index"
                        label={{ value: 'Response Index', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                        domain={[1, 5]}
                        label={{ value: 'EMA Score', angle: -90 }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: "2%" }}
                    />
                    {users.map((user, index) => (
                        <Line
                            key={user}
                            type="monotone"
                            dataKey={user}
                            stroke={getUserColor(user, index)}
                            strokeWidth={0}
                            dot={{ fill: getUserColor(user, index), strokeWidth: 2, r: 4 }}
                            connectNulls={false}
                            name={user}
                            isAnimationActive={false}
                        />
                    ))}
                    {showIndividualBestFit && (
                        <Line
                            type="monotone"
                            dataKey="overall_bestfit"
                            stroke="#000000"
                            strokeWidth={3}
                            dot={false}
                            connectNulls={true}
                            name="Overall Best Fit"
                            isAnimationActive={false}
                        />
                    )}
                </LineChart>
            );
        } else {
            return (
                <LineChart data={individualScoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: 'Response Index', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis domain={[1, 5]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                    <Legend wrapperStyle={{ paddingTop: "2%" }} />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={0}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        connectNulls={false}
                        name="EMA Score"
                        isAnimationActive={false}
                    />
                    {showIndividualBestFit && (
                        <Line
                            type="monotone"
                            dataKey="bestfit"
                            stroke="#dc2626"
                            strokeWidth={2}
                            dot={false}
                            connectNulls={true}
                            name="Best Fit Line"
                            isAnimationActive={false}
                        />
                    )}
                </LineChart>
            );
        }
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
                        EMA responses over time (Sessions are grouped when responses occur within 60 minutes of each other)
                    </p>
                    <a href="/logs" className="font-bold text-white px-4 py-3 rounded-md transition-colors duration-200 shadow-md bg-blue-500 hover:bg-blue-600">See logs</a>
                    <div className="mb-6 pt-4">
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
                            <option value="all-users">All Users</option>
                            {getUsers().map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {selectedUser && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 pb-4">
                            {selectedUser === 'all-users' ? 'All Users EMA Scores Over Time' : 'EMA Scores Over Time'}
                        </h2>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="chart-mode" className="text-sm font-medium text-gray-700">
                                        Chart Mode:
                                    </label>
                                    <select
                                        id="chart-mode"
                                        value={chartMode}
                                        onChange={(e) => setChartMode(e.target.value as ChartMode)}
                                        className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="sessions">Session Averages</option>
                                        <option value="individual">Individual Scores</option>
                                    </select>
                                </div>
                                {chartMode === 'sessions' && selectedUser === 'all-users' && (
                                    <>
                                        {normalizeData && (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={normalizationMethod}
                                                    onChange={(e) => setNormalizationMethod(e.target.value as 'session' | 'quartiles')}
                                                    className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="session">By session</option>
                                                    <option value="quartiles">By quartiles</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="normalize-data"
                                                checked={normalizeData}
                                                onChange={(e) => setNormalizeData(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="normalize-data" className="text-sm font-medium text-gray-700">
                                                Normalise
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="show-overall-bestfit"
                                                checked={showOverallBestFit}
                                                onChange={(e) => setShowOverallBestFit(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="show-overall-bestfit" className="text-sm font-medium text-gray-700">
                                                Show overall best fit line
                                            </label>
                                        </div>
                                    </>
                                )}
                                {chartMode === 'individual' && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="show-individual-bestfit"
                                            checked={showIndividualBestFit}
                                            onChange={(e) => setShowIndividualBestFit(e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="show-individual-bestfit" className="text-sm font-medium text-gray-700">
                                            Show best fit line
                                        </label>
                                    </div>
                                )}
                                {selectedUser === 'all-users' && Object.keys(groupedEMAs).length > 0 && (
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
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartMode === 'individual' ? (
                                    renderIndividualScoresChart()
                                ) : selectedUser === 'all-users' ? (
                                    <LineChart data={allUsersChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" label={{ value: 'Normalized Session', position: 'insideBottom', offset: -10 }} />
                                        <YAxis domain={[1, 5]} label={{ value: 'Average EMA Score', angle: -90 }} />
                                        <Legend wrapperStyle={{ paddingTop: "2%" }} />
                                        {getUsers().map((user, index) => {
                                            const userCount: string = `${user}_count`;
                                            if (allUsersChartData.length > 0) {
                                                console.log(">", user, " | ", allUsersChartData[0][userCount])
                                            }
                                            return (
                                                <Line
                                                    key={user}
                                                    type="monotone"
                                                    dataKey={user}
                                                    stroke={getUserColor(user, index)}
                                                    strokeWidth={0}
                                                    dot={{ fill: getUserColor(user, index), strokeWidth: 2, r: 4 }}
                                                    connectNulls={false}
                                                    name={user}
                                                    isAnimationActive={false}
                                                />
                                            )
                                        })}
                                        {showOverallBestFit && (
                                            <Line
                                                type="monotone"
                                                dataKey="overall_bestfit"
                                                stroke="#000000"
                                                strokeWidth={3}
                                                dot={false}
                                                connectNulls={true}
                                                name="Overall Best Fit"
                                                isAnimationActive={false}
                                            />
                                        )}
                                    </LineChart>
                                ) : (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="index" label={{ value: 'Response Index', position: 'insideBottom', offset: -10 }} />
                                        <YAxis domain={[1, 5]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                                        <Legend wrapperStyle={{ paddingTop: "2%" }} />
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
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                {Object.keys(groupedEMAs).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">No EMAs found</div>
                    </div>
                ) : selectedUser && selectedUser !== 'all-users' ? (
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
                                                            {sessionIndex + 1}
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
                ) : selectedUser === 'all-users' ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {getUsers().map((user, index) => (
                                <div key={user} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: getUserColor(user, index) }}
                                        ></div>
                                        <h3 className="font-semibold text-gray-900">{user}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {groupedEMAs[user].length} session{groupedEMAs[user].length !== 1 ? 's' : ''} recorded
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {groupedEMAs[user].reduce((total, session) => total + session.responses.length, 0)} total responses
                                    </p>
                                </div>
                            ))}
                        </div>
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