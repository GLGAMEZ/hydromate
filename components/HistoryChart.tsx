
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { IntakeRecord, Unit } from '../types';
import { getPastDateString } from '../lib/dateUtils';
import { convertAmount } from '../lib/conversions';

interface HistoryChartProps {
    history: IntakeRecord[];
    unit: Unit;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ history, unit }) => {
    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = getPastDateString(6 - i);
        const totalIntake = history
            .filter(record => record.date === date)
            .reduce((sum, record) => sum + record.amount, 0);
        
        return {
            name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            intake: Math.round(convertAmount(totalIntake, 'ml', unit)),
        };
    });

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                <YAxis unit={` ${unit}`} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.5rem'
                    }}
                    labelStyle={{ color: '#cbd5e1' }}
                />
                <Bar dataKey="intake" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};
