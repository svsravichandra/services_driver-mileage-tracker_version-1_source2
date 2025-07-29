
import React, { useState, useEffect } from 'react';
import { Driver, Shift } from '../types';
import { UserPlusIcon, CarIcon, LogoutIcon } from './Icons';

interface MainScreenProps {
  drivers: Driver[];
  currentShift: Shift | null;
  onAddDriver: (name: string) => Driver | null;
  onStartShift: (driverId: string) => void;
  onEndShift: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({
  drivers,
  currentShift,
  onAddDriver,
  onStartShift,
  onEndShift,
}) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [newDriverName, setNewDriverName] = useState('');
  const [showAddDriver, setShowAddDriver] = useState(false);

  useEffect(() => {
    if (drivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(drivers[0].id);
    }
  }, [drivers, selectedDriverId]);

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver = onAddDriver(newDriverName);
    if(newDriver) {
      setSelectedDriverId(newDriver.id);
      setNewDriverName('');
      setShowAddDriver(false);
    }
  };

  const getDriverName = (driverId: string) => drivers.find(d => d.id === driverId)?.name || 'Unknown Driver';

  if (currentShift) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 text-cyan-400"><CarIcon /></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Shift in Progress</h2>
          <p className="text-lg text-gray-300 mb-6">
            <span className="font-semibold">{getDriverName(currentShift.driverId)}</span> is currently driving.
          </p>
           <p className="text-sm text-gray-400 mb-1">Started at:</p>
            <p className="text-md font-mono text-cyan-300 mb-6">
                {new Date(currentShift.startTime).toLocaleString()}
            </p>
          <button
            onClick={onEndShift}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 active:scale-95 shadow-lg"
          >
            <div className="w-6 h-6 mr-2"><LogoutIcon/></div>
            End Shift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Start Your Shift</h1>
        
        <div className="mb-4">
          <label htmlFor="driver-select" className="block mb-2 text-sm font-medium text-gray-400">Select Driver</label>
          <select
            id="driver-select"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
          >
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>
        
        {showAddDriver ? (
          <form onSubmit={handleAddDriver} className="mb-4 space-y-2">
            <input
              type="text"
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              placeholder="New driver's name"
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
              autoFocus
            />
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Add</button>
              <button type="button" onClick={() => setShowAddDriver(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddDriver(true)}
            className="w-full flex items-center justify-center text-sm text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <div className="w-5 h-5 mr-1"><UserPlusIcon /></div>
            Add a new driver
          </button>
        )}
        
        <button
          onClick={() => onStartShift(selectedDriverId)}
          disabled={!selectedDriverId || showAddDriver}
          className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 active:scale-95 shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
           <div className="w-6 h-6 mr-2"><CarIcon /></div>
          Start Shift
        </button>
      </div>
    </div>
  );
};

export default MainScreen;
