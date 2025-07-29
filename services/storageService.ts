
import { Driver, Trip, Shift } from '../types';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

// Drivers
export const getDrivers = async (): Promise<Driver[]> => {
  const snapshot = await getDocs(collection(db, 'drivers'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
};

export const saveDrivers = async (drivers: Driver[]): Promise<void> => {
  // Overwrite all drivers (for compatibility with old API)
  // First, delete all existing
  const snapshot = await getDocs(collection(db, 'drivers'));
  const batchDeletes = snapshot.docs.map(d => deleteDoc(doc(db, 'drivers', d.id)));
  await Promise.all(batchDeletes);
  // Then, add all new
  const batchAdds = drivers.map(driver => setDoc(doc(db, 'drivers', driver.id), driver));
  await Promise.all(batchAdds);
};

// Trips
export const getTrips = async (): Promise<Trip[]> => {
  const snapshot = await getDocs(collection(db, 'trips'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
};

export const saveTrips = async (trips: Trip[]): Promise<void> => {
  // Overwrite all trips
  const snapshot = await getDocs(collection(db, 'trips'));
  const batchDeletes = snapshot.docs.map(d => deleteDoc(doc(db, 'trips', d.id)));
  await Promise.all(batchDeletes);
  const batchAdds = trips.map(trip => setDoc(doc(db, 'trips', trip.id), trip));
  await Promise.all(batchAdds);
};

// Current Shift
export const getCurrentShift = async (): Promise<Shift | null> => {
  const docRef = doc(db, 'currentShift', 'state');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Shift) : null;
};

export const saveCurrentShift = async (shift: Shift): Promise<void> => {
  await setDoc(doc(db, 'currentShift', 'state'), shift);
};

export const clearCurrentShift = async (): Promise<void> => {
  await deleteDoc(doc(db, 'currentShift', 'state'));
};
