
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNotifications } from './hooks/useNotifications';
import { Settings, IntakeRecord, Unit } from './types';
import { getTodayDateString } from './lib/dateUtils';
import { convertAmount } from './lib/conversions';
import { SettingsModal } from './components/SettingsModal';
import { HistoryChart } from './components/HistoryChart';
import { ProgressBar } from './components/ProgressBar';
import { WaterDropIcon, SettingsIcon, HistoryIcon, PlusIcon, DownloadIcon, UploadIcon } from './components/Icon';

const App: React.FC = () => {
    const [settings, setSettings] = useLocalStorage<Settings>('hydroMateSettings', {
        dailyGoal: 2000,
        unit: 'ml',
        reminderInterval: 60,
        glassSize: 250,
    });
    const [history, setHistory] = useLocalStorage<IntakeRecord[]>('hydroMateHistory', []);
    const [lastResetDate, setLastResetDate] = useLocalStorage<string>('hydroMateLastReset', '');
    const [currentIntake, setCurrentIntake] = useState<number>(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const { requestPermission, sendNotification, setupReminder, clearReminder } = useNotifications();

    const today = getTodayDateString();

    useEffect(() => {
        requestPermission();
    }, [requestPermission]);

    useEffect(() => {
        if (settings.reminderInterval > 0) {
            setupReminder(settings.reminderInterval);
        } else {
            clearReminder();
        }
        return () => clearReminder();
    }, [settings.reminderInterval, setupReminder, clearReminder]);

    useEffect(() => {
        if (lastResetDate !== today) {
            setCurrentIntake(0);
            setLastResetDate(today);
        } else {
            const todaysIntake = history
                .filter(record => record.date === today)
                .reduce((acc, record) => acc + record.amount, 0);
            setCurrentIntake(todaysIntake);
        }
    }, [today, history, lastResetDate, setLastResetDate]);

    const progress = useMemo(() => {
        return settings.dailyGoal > 0 ? (currentIntake / settings.dailyGoal) * 100 : 0;
    }, [currentIntake, settings.dailyGoal]);

    const handleAddIntake = useCallback((amount: number) => {
        const newTotal = currentIntake + amount;
        
        const oldProgress = (currentIntake / settings.dailyGoal) * 100;

        const milestones = [25, 50, 75, 100];
        milestones.forEach(milestone => {
            const newProgress = (newTotal / settings.dailyGoal) * 100;
            if (oldProgress < milestone && newProgress >= milestone) {
                sendNotification(`Milestone Reached! 🎉`, {
                    body: `You've reached ${milestone}% of your daily goal. Keep it up!`,
                });
            }
        });

        setCurrentIntake(newTotal);
        const newRecord: IntakeRecord = {
            id: Date.now(),
            amount,
            date: today,
            timestamp: new Date().toISOString(),
        };
        setHistory([...history, newRecord]);
    }, [currentIntake, settings.dailyGoal, history, setHistory, today, sendNotification]);

    const handleDataExport = () => {
        const data = { settings, history, lastResetDate };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hydromate_backup_${today}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDataImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    if (data.settings && data.history && data.lastResetDate) {
                        setSettings(data.settings);
                        setHistory(data.history);
                        setLastResetDate(data.lastResetDate);
                        // Trigger a re-evaluation of today's intake
                        const todaysIntake = data.history
                            .filter((record: IntakeRecord) => record.date === today)
                            .reduce((acc: number, record: IntakeRecord) => acc + record.amount, 0);
                        setCurrentIntake(todaysIntake);
                        alert('Data imported successfully!');
                    } else {
                        alert('Invalid backup file.');
                    }
                } catch (error) {
                    alert('Error reading backup file.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    const presetAmounts = [150, 250, 500];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 text-white font-sans p-4 flex flex-col items-center">
            <header className="w-full max-w-md flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <WaterDropIcon className="w-8 h-8 text-blue-400" />
                    <h1 className="text-2xl font-bold">HydroMate</h1>
                </div>
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-blue-800 transition">
                    <SettingsIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="w-full max-w-md flex-grow flex flex-col items-center">
                <div className="w-full bg-slate-800/50 rounded-2xl p-6 mb-6 text-center shadow-lg">
                    <div className="relative w-48 h-48 mx-auto mb-4">
                        <ProgressBar progress={progress} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-blue-300">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <p className="text-lg">
                        <span className="font-semibold">{Math.round(convertAmount(currentIntake, 'ml', settings.unit))}</span>
                        <span className="text-slate-400"> / {Math.round(convertAmount(settings.dailyGoal, 'ml', settings.unit))} {settings.unit}</span>
                    </p>
                    <p className="text-slate-400 text-sm">Today's Intake</p>
                </div>

                <div className="w-full bg-slate-800/50 rounded-2xl p-6 mb-6 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-center">Log Your Intake 💧</h2>
                    <div className="flex justify-center space-x-3 mb-4">
                        {presetAmounts.map(amount => (
                            <button key={amount} onClick={() => handleAddIntake(amount)} className="bg-blue-600 hover:bg-blue-500 transition-colors duration-300 text-white font-bold py-3 px-5 rounded-xl shadow-md">
                                +{convertAmount(amount, 'ml', settings.unit)} {settings.unit}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => handleAddIntake(settings.glassSize)} className="flex-grow bg-slate-700 hover:bg-slate-600 transition-colors duration-300 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2">
                            <PlusIcon className="w-5 h-5" />
                            <span>A Glass ({convertAmount(settings.glassSize, 'ml', settings.unit)} {settings.unit})</span>
                        </button>
                    </div>
                </div>

                <div className="w-full bg-slate-800/50 rounded-2xl p-6 shadow-lg">
                    <button onClick={() => setShowHistory(!showHistory)} className="w-full flex justify-between items-center text-lg font-semibold">
                        <span>Weekly History</span>
                        <HistoryIcon className={`w-6 h-6 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    </button>
                    {showHistory && (
                        <div className="mt-4 h-64">
                            <HistoryChart history={history} unit={settings.unit} />
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="w-full max-w-md text-center text-slate-500 text-sm mt-8">
                Made with 💧 by You
            </footer>
            
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={setSettings}
            >
                 <div className="mt-6 pt-6 border-t border-slate-700">
                    <h3 className="text-lg font-semibold mb-3">Data Management</h3>
                    <div className="flex space-x-4">
                        <button onClick={handleDataExport} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
                            <DownloadIcon className="w-5 h-5"/>
                            <span>Export</span>
                        </button>
                        <label className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center justify-center space-x-2">
                            <UploadIcon className="w-5 h-5"/>
                            <span>Import</span>
                            <input type="file" accept=".json" onChange={handleDataImport} className="hidden"/>
                        </label>
                    </div>
                </div>
            </SettingsModal>
        </div>
    );
};

export default App;
