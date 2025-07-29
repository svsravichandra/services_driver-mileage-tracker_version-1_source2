
import React, { useMemo } from 'react';
import { Driver, Trip } from '../types';
import { UserCircleIcon, ClockIcon, MapIcon } from './Icons';

interface DashboardProps {
  drivers: Driver[];
  trips: Trip[];
  onSelectDriver: (driverId: string) => void;
}

interface DriverStats {
  driver: Driver;
  totalMiles: number;
  totalMinutes: number;
  tripCount: number;
}

const formatDuration = (totalMinutes: number) => {
    if (totalMinutes < 1) return "< 1 min";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    let result = '';
    if (hours > 0) {
        result += `${hours} hr${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        result += ` ${minutes} min${minutes > 1 ? 's' : ''}`;
    }
    return result.trim();
}

const DriverStatCard: React.FC<{ stat: DriverStats, onSelect: () => void }> = ({ stat, onSelect }) => (
  <div onClick={onSelect} className="bg-gray-800 rounded-xl shadow-lg p-5 transition-transform hover:scale-105 duration-300 cursor-pointer">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 text-cyan-400 mr-4"><UserCircleIcon /></div>
      <h3 className="text-xl font-bold text-white truncate">{stat.driver.name}</h3>
    </div>
    <div className="space-y-3">
      <div className="flex items-center text-gray-300">
        <MapIcon className="w-5 h-5 mr-3 text-gray-400" />
        <span className="font-semibold">{stat.totalMiles.toFixed(1)} miles</span>
        <span className="text-sm text-gray-500 ml-auto">{stat.tripCount} trip{stat.tripCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center text-gray-300">
        <ClockIcon className="w-5 h-5 mr-3 text-gray-400" />
        <span>{formatDuration(stat.totalMinutes)} driven</span>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ drivers, trips, onSelectDriver }) => {
  const driverStats: DriverStats[] = useMemo(() => {
    const statsMap = new Map<string, DriverStats>();

    drivers.forEach(driver => {
      statsMap.set(driver.id, {
        driver,
        totalMiles: 0,
        totalMinutes: 0,
        tripCount: 0,
      });
    });

    trips.forEach(trip => {
      const stat = statsMap.get(trip.driverId);
      if (stat) {
        stat.totalMiles += (trip.endOdometer - trip.startOdometer);
        const durationMs = new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime();
        stat.totalMinutes += (durationMs / 60000);
        stat.tripCount += 1;
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalMiles - a.totalMiles);
  }, [drivers, trips]);

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard is Empty</h2>
        <p className="text-gray-400">Complete a shift to see driving statistics here.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="text-3xl font-bold text-white mb-6 px-2">Driver Leaderboard</h1>
      <div className="space-y-4">
        {driverStats.map(stat => (
          stat.tripCount > 0 ? <DriverStatCard key={stat.driver.id} stat={stat} onSelect={() => onSelectDriver(stat.driver.id)} /> : null
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
