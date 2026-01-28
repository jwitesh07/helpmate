// src/components/HelperMapSection.jsx

import React from 'react';

// --- Local Components ---

/**
 * Card component for displaying a nearby helper's details.
 */
const HelperInfoCard = ({ helper }) => (
    // Note: Tailwind utility classes like bg-blue-50 are often dynamic and require a safe list
    // in a real-world Tailwind setup (e.g., tailwind.config.js) to work correctly when
    // used with string interpolation like this. For this example, we assume they are safe.
    <div className={`helper-info bg-${helper.color}-50 border border-${helper.color}-200 rounded-xl p-4`}>
        <div className="flex items-center space-x-3 mb-2">
            <div className={`w-8 h-8 bg-${helper.color}-500 rounded-full flex items-center justify-center text-white text-sm font-bold`}>{helper.initial}</div>
            <div>
                <h4 className="font-semibold text-gray-900">{helper.name}</h4>
                <p className="text-sm text-gray-600">⭐ {helper.rating} • {helper.distance} km away</p>
            </div>
        </div>
        <p className="text-xs text-gray-500 mb-2">Skills: {helper.skills}</p>
        <button className={`w-full bg-${helper.color}-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-${helper.color}-600 transition-colors`}>
            Request Help
        </button>
    </div>
);


// --- Static Data (For Helpers Map Section) ---
const HELPER_DATA = [
    { initial: 'MR', name: 'Mike R.', rating: 4.9, distance: 1.2, skills: 'Delivery, Cleaning', color: 'blue', pinPosition: { top: '30%', left: '40%' } },
    { initial: 'SJ', name: 'Sara J.', rating: 4.8, distance: 2.5, skills: 'Moving, Cleaning', color: 'orange', pinPosition: { top: '60%', right: '20%' } },
    { initial: 'AK', name: 'Amit K.', rating: 4.7, distance: 0.8, skills: 'Delivery, Errands', color: 'emerald', pinPosition: { bottom: '20%', left: '30%' } },
];


/**
 * Renders the section dedicated to showing nearby helpers on a map.
 */
const HelperMapSection = () => (
    <div className="mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🗺️ Helpers Near You (Mock Data)</h3>
            
            {/* Map View Area */}
            <div className="relative bg-gray-100 rounded-xl h-64 overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500">Interactive Map View</div>
                </div>
                {HELPER_DATA.map((helper) => (
                    <div 
                        key={helper.initial}
                        className={`helper-pin absolute w-10 h-10 bg-${helper.color}-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-110 transition-transform`} 
                        style={helper.pinPosition}
                    >
                        {helper.initial}
                    </div>
                ))}
            </div>
            
            {/* Helper Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {HELPER_DATA.map((helper) => (
                    <HelperInfoCard key={helper.initial} helper={helper} />
                ))}
            </div>
        </div>
    </div>
);

export default HelperMapSection;