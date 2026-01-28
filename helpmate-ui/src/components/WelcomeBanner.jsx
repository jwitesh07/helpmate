// src/components/WelcomeBanner.jsx

import React from 'react';
import StatCard from './StatCard';

/**
 * Dynamic welcome section displaying mode-specific stats.
 * @param {object} props
 * @param {boolean} props.isHelper - Current mode
 * @param {object} props.stats - Stats object for the current mode
 * @param {string} props.userName - The user's first name (passed from App.jsx's userData)
 */
const WelcomeBanner = ({ isHelper, stats, userName }) => {
    return (
        <div className="mb-8">
            <div className="gradient-bg rounded-2xl p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {userName || 'User'}! 👋
                </h2>
                <p className="text-lg opacity-90">
                    {isHelper 
                        ? 'Ready to help others and earn money? Check out available tasks below.'
                        : 'Need help with something? Post a task or check your active requests.'}
                </p>
                <div className="mt-4 flex items-center space-x-6">
                    <StatCard number={stats.number1} label={stats.label1} />
                    <StatCard number={stats.number2} label={stats.label2} />
                    <StatCard number={stats.number3} label={stats.label3} />
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;