// ./app/logs/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { LogAction, UserLog, Session, GroupedLogs } from './interfaces';

export default function LogsPage() {
    const [logs, setLogs] = useState<UserLog[]>([]);
    const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [selectedSessions, setSelectedSessions] = useState<{ [user: string]: string }>({});

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await fetch('/api/logs');
            if (!response.ok) {
                throw new Error('Failed to fetch logs');
            }
            const data = await response.json();
            setLogs(data);
            console.log(logs, data);
            processLogs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const consolidateActions = (actions: LogAction[]): LogAction[] => {
        const consolidated: LogAction[] = [];
        let i = 0;

        while (i < actions.length) {
            const currentAction = actions[i];

            if (currentAction.action === "Video was put in play.") {
                if (i + 1 < actions.length && actions[i + 1].action === "Video was put in play.") {
                    i += 2;
                    consolidated.push(currentAction);
                    continue;
                }
            }

            if (currentAction.action.includes("Playback speed was")) {
                const speedActions = [currentAction];
                let j = i + 1;

                while (j < actions.length && actions[j].action.includes("Playback speed was")) {
                    const timeDiff = new Date(actions[j].timestamp).getTime() - new Date(actions[j - 1].timestamp).getTime();
                    if (timeDiff < 5000) {
                        speedActions.push(actions[j]);
                        j++;
                    } else {
                        break;
                    }
                }

                if (speedActions.length > 1) {
                    const firstSpeed = extractSpeed(speedActions[0].action);
                    const lastSpeed = extractSpeed(speedActions[speedActions.length - 1].action);

                    if (firstSpeed && lastSpeed && firstSpeed !== lastSpeed) {
                        const consolidatedAction: LogAction = {
                            action: `Playback speed changed from ${firstSpeed}% to ${lastSpeed}%`,
                            timestamp: speedActions[speedActions.length - 1].timestamp
                        };
                        consolidated.push(consolidatedAction);
                    } else {
                        consolidated.push(currentAction);
                    }
                    i = j;
                } else {
                    const speed = extractSpeed(currentAction.action);
                    if (speed) {
                        consolidated.push({
                            ...currentAction,
                            action: currentAction.action.replace(/\d+\.?\d*/, `${speed}%`)
                        });
                    } else {
                        consolidated.push(currentAction);
                    }
                    i++;
                }
            } else if (currentAction.action.includes("The video was seeked to")) {
                const seekActions = [currentAction];
                let j = i + 1;

                while (j < actions.length && actions[j].action.includes("The video was seeked to")) {
                    const timeDiff = new Date(actions[j].timestamp).getTime() - new Date(actions[j - 1].timestamp).getTime();
                    if (timeDiff < 5000) {
                        seekActions.push(actions[j]);
                        j++;
                    } else {
                        break;
                    }
                }

                if (seekActions.length > 1) {
                    const firstSeek = extractSeekTime(seekActions[0].action);
                    const lastSeek = extractSeekTime(seekActions[seekActions.length - 1].action);

                    if (firstSeek && lastSeek && firstSeek !== lastSeek) {
                        const consolidatedAction: LogAction = {
                            action: `The video was seeked from ${firstSeek} to ${lastSeek}`,
                            timestamp: seekActions[seekActions.length - 1].timestamp
                        };
                        consolidated.push(consolidatedAction);
                    } else {
                        consolidated.push(currentAction);
                    }
                    i = j;
                } else {
                    consolidated.push(currentAction);
                    i++;
                }
            } else if (currentAction.action.toLowerCase().includes("volume was")) {
                // Extract volume type (Speaker, Music, Other)
                const volumeType = extractVolumeType(currentAction.action);
                const volumeActions = [currentAction];
                let j = i + 1;

                // Only consolidate actions of the same volume type
                while (j < actions.length &&
                    actions[j].action.toLowerCase().includes("volume was") &&
                    extractVolumeType(actions[j].action) === volumeType) {
                    const timeDiff = new Date(actions[j].timestamp).getTime() - new Date(actions[j - 1].timestamp).getTime();
                    if (timeDiff < 5000) {
                        volumeActions.push(actions[j]);
                        j++;
                    } else {
                        break;
                    }
                }

                if (volumeActions.length > 1) {
                    const firstVolume = extractVolume(volumeActions[0].action);
                    const lastVolume = extractVolume(volumeActions[volumeActions.length - 1].action);

                    if (firstVolume && lastVolume && firstVolume !== lastVolume) {
                        const consolidatedAction: LogAction = {
                            action: `${volumeType} volume changed from ${firstVolume}% to ${lastVolume}%`,
                            timestamp: volumeActions[volumeActions.length - 1].timestamp
                        };
                        consolidated.push(consolidatedAction);
                    } else {
                        const volume = extractVolume(currentAction.action);
                        if (volume) {
                            consolidated.push({
                                ...currentAction,
                                action: currentAction.action.replace(/\d+\.?\d*/, `${volume}%`)
                            });
                        } else {
                            consolidated.push(currentAction);
                        }
                    }
                    i = j;
                } else {
                    const volume = extractVolume(currentAction.action);
                    if (volume) {
                        consolidated.push({
                            ...currentAction,
                            action: currentAction.action.replace(/\d+\.?\d*/, `${volume}%`)
                        });
                    } else {
                        consolidated.push(currentAction);
                    }
                    i++;
                }
            } else {
                consolidated.push(currentAction);
                i++;
            }
        }

        return consolidated;
    };

    // Add this new helper function to extract volume type
    const extractVolumeType = (action: string): string => {
        const lowerAction = action.toLowerCase();
        if (lowerAction.includes("speaker volume was")) {
            return "Speaker";
        } else if (lowerAction.includes("music volume was")) {
            return "Music";
        } else if (lowerAction.includes("other volume was")) {
            return "Other";
        }
        // Fallback for generic "volume was" without type
        return "Volume";
    };

    const extractSeekTime = (action: string): string | null => {
        const match = action.match(/(\d+:\d+(?:\.\d+)?)/);
        return match ? match[1] : null;
    };

    const extractSpeed = (action: string): string | null => {
        const match = action.match(/(\d+\.?\d*)/);
        if (match) {
            const decimal = parseFloat(match[1]);
            return Math.round(decimal * 100).toString();
        }
        return null;
    };

    const extractVolume = (action: string): string | null => {
        const match = action.match(/(\d+\.?\d*)/);
        if (match) {
            const decimal = parseFloat(match[1]);
            return Math.round(decimal * 100).toString();
        }
        return null;
    };

    const processLogs = (logsData: UserLog[]) => {
        const grouped: GroupedLogs = {};

        const SESSION_GAP_MS = 60 * 60 * 1000;

        logsData.forEach(log => {
            if (!grouped[log.user]) {
                grouped[log.user] = [];
            }

            const sortedActions = [...log.actions].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

            let currentSession: Session | null = null;

            sortedActions.forEach(action => {
                const actionTime = new Date(action.timestamp);

                if (!currentSession ||
                    (actionTime.getTime() - currentSession.endTime.getTime()) > SESSION_GAP_MS) {
                    if (currentSession) {
                        currentSession.actions = consolidateActions(currentSession.actions);
                        grouped[log.user].push(currentSession);
                    }
                    currentSession = {
                        startTime: actionTime,
                        endTime: actionTime,
                        actions: [action],
                        duration: '0 minutes'
                    };
                } else {
                    currentSession.actions.push(action);
                    currentSession.endTime = actionTime;
                }
            });

            if (currentSession) {
                (currentSession as Session).actions = consolidateActions((currentSession as Session).actions);
                grouped[log.user].push(currentSession);
            }
        });

        Object.keys(grouped).forEach(user => {
            grouped[user].forEach(session => {
                const durationMs = session.endTime.getTime() - session.startTime.getTime();
                const minutes = Math.round(durationMs / (1000 * 60));
                session.duration = minutes === 0 ? 'Less than 1 minute' : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            });

            grouped[user].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        });

        setGroupedLogs(grouped);
    };

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

    const getActionType = (action: LogAction): { key: string; value: string } => {
        const lowerCaseAction = action.action.toLowerCase();

        if (["volume", "audio"].some(i => lowerCaseAction.includes(i))) {
            return { key: "Volume", value: "bg-blue-100 text-blue-800" };
        }
        if (lowerCaseAction.includes("caption")) {
            return { key: "Captions", value: "bg-purple-100 text-purple-800" };
        }
        if (lowerCaseAction.includes("highlight")) {
            return { key: "Highlight", value: "bg-yellow-100 text-yellow-800" };
        }
        if (["playback speed", "automated speed"].some(i => lowerCaseAction.includes(i))) {
            return { key: "Speed", value: "bg-green-100 text-green-800" };
        }
        if (["video was put in play", "paused", "10 seconds", "seeked"].some(i => lowerCaseAction.includes(i))) {
            return { key: "Playback", value: "bg-orange-100 text-orange-800" };
        }

        return { key: "Other", value: "bg-gray-100 text-gray-800" };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading logs...</div>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">User Activity Logs</h1>
                    <p className="text-gray-600 mb-4">
                        Sessions are grouped when actions occur within 60 minutes of each other
                    </p>
                    <a href="/emas" className="font-bold text-white px-4 py-3 rounded-md transition-colors duration-200 shadow-md bg-blue-500 hover:bg-blue-600">See EMAs</a>
                    <div className="mb-4 pt-4">
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
                            Select User:
                        </label>
                        <select
                            id="user-select"
                            value={selectedUser}
                            onChange={(e) => {
                                setSelectedUser(e.target.value);
                                setSelectedSessions({});
                            }}
                            className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Users</option>
                            {Object.keys(groupedLogs).map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {Object.keys(groupedLogs).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">No logs found</div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedLogs)
                            .filter(([user]) => selectedUser === 'all' || user === selectedUser)
                            .map(([user, sessions]) => (
                                <div key={user} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {user}
                                        </h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
                                        </p>
                                        <div className="mt-3">
                                            <label htmlFor={`session-select-${user}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                Select Session:
                                            </label>
                                            <select
                                                id={`session-select-${user}`}
                                                value={selectedSessions[user] || 'all'}
                                                onChange={(e) => {
                                                    setSelectedSessions(prev => ({
                                                        ...prev,
                                                        [user]: e.target.value
                                                    }));
                                                }}
                                                className="block w-48 px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">All Sessions</option>
                                                {sessions.map((_, index) => (
                                                    <option key={index} value={index.toString()}>
                                                        Session {index + 1}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="space-y-6">
                                            {sessions
                                                .filter((_, sessionIndex) =>
                                                    selectedSessions[user] === 'all' ||
                                                    selectedSessions[user] === undefined ||
                                                    selectedSessions[user] === sessionIndex.toString()
                                                )
                                                .map((session, sessionIndex) => {
                                                    const actualSessionIndex = selectedSessions[user] === 'all' || selectedSessions[user] === undefined
                                                        ? sessionIndex
                                                        : parseInt(selectedSessions[user]);

                                                    return (
                                                        <div key={sessionIndex} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        Session {actualSessionIndex + 1}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">
                                                                        {formatDateTime(session.startTime)} to {formatDateTime(session.endTime).slice(-8)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-400 text-right">
                                                                        {session.actions.length} action{session.actions.length !== 1 ? 's' : ''}
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    Duration: {session.duration}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                {session.actions.map((action, actionIndex) => (
                                                                    <div key={actionIndex} className="flex items-start space-x-3 py-2">
                                                                        <div className="flex-shrink-0 py-2 w-16 text-xs text-gray-500 font-mono mt-0.5">
                                                                            {formatTime(new Date(action.timestamp))}
                                                                        </div>
                                                                        <div className="flex-1 text-sm text-gray-700 bg-white px-3 py-2 rounded border">
                                                                            {action.action}
                                                                            <span className={`px-2 py-1 ml-3 rounded text-xs font-medium ${getActionType(action).value}`}>
                                                                                {getActionType(action).key}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}