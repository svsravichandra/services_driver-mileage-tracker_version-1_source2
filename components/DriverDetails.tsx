import React, { useState } from 'react';
import { Driver, Trip } from '../types';
import { BackArrowIcon, ClockIcon, MapIcon, CalendarIcon } from './Icons';

interface DriverDetailsProps {
    driver: Driver;
    trips: Trip[];
    onBack: () => void;
}

const formatDuration = (start: string, end: string) => {
    const totalMinutes = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    if (totalMinutes < 1) return "< 1 min";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    let result = '';
    if (hours > 0) result += `${hours} hr${hours > 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} min${minutes > 1 ? 's' : ''}`;
    return result.trim();
}

const TripCard: React.FC<{trip: Trip}> = ({ trip }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const miles = trip.endOdometer - trip.startOdometer;
    const duration = formatDuration(trip.startTime, trip.endTime);
    const date = new Date(trip.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const startTime = new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(trip.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center text-gray-400 text-sm">
                <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>{date}</span>
                </div>
                <span className="font-mono">{startTime} - {endTime}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-cyan-400 font-semibold text-lg">
                    <MapIcon className="w-5 h-5 mr-2" />
                    <span>{miles.toFixed(1)} miles</span>
                </div>
                <div className="flex items-center text-gray-300">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    <span>{duration}</span>
                </div>
            </div>

            <div className="mt-4 text-center">
                 <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold py-1 px-3 rounded-full bg-gray-700/50 hover:bg-gray-700 transition-colors"
                    aria-expanded={isExpanded}
                 >
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-700/60 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-400">Start Odometer</p>
                            <p className="font-mono text-lg text-white">{trip.startOdometer.toFixed(1)}</p>
                            <img src={trip.startOdometerImage} alt="Start Odometer" className="rounded-lg w-full h-auto border-2 border-gray-700" loading="lazy" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-400">End Odometer</p>
                            <p className="font-mono text-lg text-white">{trip.endOdometer.toFixed(1)}</p>
                            <img src={trip.endOdometerImage} alt="End Odometer" className="rounded-lg w-full h-auto border-2 border-gray-700" loading="lazy" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, trips, onBack }) => {
    const driverTrips = trips
        .filter(t => t.driverId === driver.id)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    return (
        <div className="py-4">
            <button onClick={onBack} className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors font-semibold">
                <BackArrowIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">{driver.name}'s Trips</h1>
            <p className="text-gray-400 mb-6">{driverTrips.length} trip{driverTrips.length !== 1 ? 's' : ''} recorded.</p>

            {driverTrips.length > 0 ? (
                 <div className="space-y-4">
                    {driverTrips.map(trip => <TripCard key={trip.id} trip={trip} />)}
                </div>
            ) : (
                <p className="text-gray-500 text-center mt-8">No trips found for this driver.</p>
            )}
        </div>
    );
};

export default DriverDetails;