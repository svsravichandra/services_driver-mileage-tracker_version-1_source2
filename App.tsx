import React, { useState, useEffect, useCallback } from 'react';
import { Driver, Trip, Shift, View } from './types';
import * as storage from './services/storageService';
import { extractOdometerReading } from './services/geminiService';
import MainScreen from './components/MainScreen';
import CameraView from './components/CameraView';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import DriverDetails from './components/DriverDetails';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.MAIN);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [cameraFor, setCameraFor] = useState<'start' | 'end' | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [showOdometerRetry, setShowOdometerRetry] = useState(false);

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingMessage('Loading data...');
        const [driversData, tripsData, shiftData] = await Promise.all([
          storage.getDrivers(),
          storage.getTrips(),
          storage.getCurrentShift()
        ]);
        setDrivers(driversData);
        setTrips(tripsData);
        setCurrentShift(shiftData);
      } catch (e: unknown) {
        setError('Failed to load data from Firestore.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddDriver = async (name: string): Promise<Driver | null> => {
    if (!name.trim() || drivers.some((d: Driver) => d.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('Driver name cannot be empty or already exist.');
      setTimeout(() => setError(null), 3000);
      return null;
    }
    const newDriver: Driver = { id: Date.now().toString(), name: name.trim() };
    const updatedDrivers = [...drivers, newDriver];
    setDrivers(updatedDrivers);
    await storage.saveDrivers(updatedDrivers);
    return newDriver;
  };

  const handleStartShiftRequest = (driverId: string) => {
    if(currentShift) {
        setError('A shift is already in progress.');
        return;
    }
    setError(null);
    setCameraFor('start');
    const tempShift = { driverId, startOdometer: 0, startTime: new Date().toISOString() };
    setCurrentShift(tempShift); // Temporarily set for camera view context
    setView(View.CAMERA);
  };

  const handleEndShiftRequest = () => {
    if (!currentShift) {
        setError('No active shift to end.');
        return;
    }
    setError(null);
    setCameraFor('end');
    setView(View.CAMERA);
  };

  const handleImageCapture = useCallback(async (base64Image: string) => {
    setView(View.MAIN);
    setIsLoading(true);
    setError(null);
    setShowOdometerRetry(false);

    const fullImageDataUrl = `data:image/jpeg;base64,${base64Image}`;

    try {
      setLoadingMessage('Reading odometer...');
      const odometer = await extractOdometerReading(base64Image);

      if (cameraFor === 'start' && currentShift) {
        setLoadingMessage('Starting shift...');
        if(odometer <= 0) throw new Error("Invalid odometer reading. Please try again.");

        const lastTrip = trips.length > 0 ? trips[trips.length - 1] : null;
        if (lastTrip && odometer < lastTrip.endOdometer) {
            throw new Error(`Start odometer (${odometer}) must be >= last trip's end odometer (${lastTrip.endOdometer}).`);
        }
        
        const newShift: Shift = { ...currentShift, startOdometer: odometer, startOdometerImage: fullImageDataUrl };
        setCurrentShift(newShift);
        await storage.saveCurrentShift(newShift);
        setLoadingMessage(`Shift started for ${drivers.find((d: Driver) => d.id === newShift.driverId)?.name}!`);
        setCameraFor(null);
        setTimeout(() => {
            setIsLoading(false);
            setLoadingMessage('');
        }, 2000);

      } else if (cameraFor === 'end' && currentShift) {
        setLoadingMessage('Ending shift...');
        if (odometer <= currentShift.startOdometer) {
          throw new Error('End odometer reading must be greater than start reading.');
        }
        if (!currentShift.startOdometerImage) {
          await storage.clearCurrentShift();
          setCurrentShift(null);
          throw new Error("Critical error: Start image was missing. The broken shift has been cleared. Please start a new shift.");
        }
        
        const newTrip: Trip = {
          id: Date.now().toString(),
          driverId: currentShift.driverId,
          startOdometer: currentShift.startOdometer,
          endOdometer: odometer,
          startTime: currentShift.startTime,
          endTime: new Date().toISOString(),
          startOdometerImage: currentShift.startOdometerImage,
          endOdometerImage: fullImageDataUrl,
        };

        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        await storage.saveTrips(updatedTrips);
        
        setCurrentShift(null);
        await storage.clearCurrentShift();
        setLoadingMessage('Shift ended successfully!');
        setCameraFor(null);
        
        setTimeout(() => {
            setIsLoading(false);
            setLoadingMessage('');
            setView(View.DASHBOARD);
        }, 2000);
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      setShowOdometerRetry(true);
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [cameraFor, currentShift, drivers, trips]);
  
  const handleCancelCamera = () => {
    if(cameraFor === 'start'){
      setCurrentShift(null); // Clear temporary shift
    }
    setView(View.MAIN);
    setCameraFor(null);
  };

  const handleRetryOdometer = () => {
    setError(null);
    setShowOdometerRetry(false);
    setView(View.CAMERA); // Go back to camera to try again
  };

  const handleCancelOdometer = () => {
    setError(null);
    setShowOdometerRetry(false);
    if (cameraFor === 'start') {
        setCurrentShift(null); // Abort the new shift
    }
    setCameraFor(null);
    setView(View.MAIN);
  };
  
  const handleSelectDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
  };

  const handleBackToDashboard = () => {
    setSelectedDriverId(null);
  };
  
  const renderContent = () => {
    if (isLoading && loadingMessage) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
            </div>
        );
    }

    switch (view) {
      case View.CAMERA:
        return <CameraView onCapture={handleImageCapture} onCancel={handleCancelCamera} />;
      case View.DASHBOARD:
        if (selectedDriverId) {
            const driver = drivers.find((d: Driver) => d.id === selectedDriverId);
            if (!driver) { // Should not happen, but a good safeguard
                setSelectedDriverId(null);
                return <Dashboard drivers={drivers} trips={trips} onSelectDriver={handleSelectDriver} />;
            }
            return <DriverDetails driver={driver} trips={trips} onBack={handleBackToDashboard} />;
        }
        return <Dashboard drivers={drivers} trips={trips} onSelectDriver={handleSelectDriver}/>;
      case View.MAIN:
      default:
        return (
          <MainScreen
            drivers={drivers}
            currentShift={currentShift}
            onAddDriver={handleAddDriver}
            onStartShift={handleStartShiftRequest}
            onEndShift={handleEndShiftRequest}
          />
        );
    }
  };

  return (
    <Layout currentView={view} setView={setView}>
        {renderContent()}
        {error && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="alertdialog" aria-modal="true" aria-labelledby="error-title">
                <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl text-center max-w-sm w-full mx-4">
                    <h2 id="error-title" className="font-bold text-lg text-red-500 mb-2">Error</h2>
                    <p className="mb-6">{error}</p>
                    {showOdometerRetry ? (
                        <div className="flex space-x-4">
                            <button onClick={handleRetryOdometer} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Retry
                            </button>
                            <button onClick={handleCancelOdometer} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => { setError(null); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            OK
                        </button>
                    )}
                </div>
            </div>
        )}
    </Layout>
  );
};

export default App;