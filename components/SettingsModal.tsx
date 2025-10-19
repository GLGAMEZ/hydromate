
import React, { useState, useEffect } from 'react';
import { Settings, Unit } from '../types';
import { XIcon } from './Icon';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSave: (newSettings: Settings) => void;
    children?: React.ReactNode;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, children }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };
    
    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newUnit = e.target.value as Unit;
      // When unit changes, we don't convert the goal value. User expects to enter a new goal in the new unit.
      // However, the underlying value is always stored in ml. For user convenience, we might pre-fill.
      // Let's keep it simple: just update the unit type. The user can adjust the number.
      setLocalSettings(prev => ({...prev, unit: newUnit}));
    }

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        let valueInMl: number;
        switch (localSettings.unit) {
            case 'oz': valueInMl = value * 29.5735; break;
            case 'cups': valueInMl = value * 236.588; break;
            default: valueInMl = value;
        }
        setLocalSettings(prev => ({...prev, dailyGoal: isNaN(valueInMl) ? 0 : Math.round(valueInMl)}));
    }
    
    const handleGlassSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
         let valueInMl: number;
        switch (localSettings.unit) {
            case 'oz': valueInMl = value * 29.5735; break;
            case 'cups': valueInMl = value * 236.588; break;
            default: valueInMl = value;
        }
        setLocalSettings(prev => ({...prev, glassSize: isNaN(valueInMl) ? 0 : Math.round(valueInMl)}));
    }
    
    const displayGoal = Math.round(localSettings.dailyGoal * (localSettings.unit === 'oz' ? (1/29.5735) : localSettings.unit === 'cups' ? (1/236.588) : 1));
    const displayGlassSize = Math.round(localSettings.glassSize * (localSettings.unit === 'oz' ? (1/29.5735) : localSettings.unit === 'cups' ? (1/236.588) : 1));

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6">Settings</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="dailyGoal" className="block mb-1 text-slate-300">Daily Goal</label>
                        <div className="flex">
                            <input
                                id="dailyGoal"
                                type="number"
                                value={displayGoal}
                                onChange={handleGoalChange}
                                className="w-full bg-slate-700 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select value={localSettings.unit} onChange={handleUnitChange} className="bg-slate-600 rounded-r-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="ml">ml</option>
                                <option value="oz">oz</option>
                                <option value="cups">cups</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="glassSize" className="block mb-1 text-slate-300">Default Glass Size ({localSettings.unit})</label>
                        <input
                            id="glassSize"
                            type="number"
                            value={displayGlassSize}
                            onChange={handleGlassSizeChange}
                            className="w-full bg-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="reminder" className="block mb-1 text-slate-300">Reminder Interval</label>
                        <select
                            id="reminder"
                            value={localSettings.reminderInterval}
                            onChange={e => setLocalSettings(prev => ({...prev, reminderInterval: parseInt(e.target.value)}))}
                            className="w-full bg-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="0">Off</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                        </select>
                    </div>
                </div>

                {children}

                <div className="mt-8 flex justify-end">
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg">
                        Save
                    </button>
                </div>
            </div>
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fade-in {
                animation: fade-in 0.2s ease-out forwards;
              }
            `}</style>
        </div>
    );
};
