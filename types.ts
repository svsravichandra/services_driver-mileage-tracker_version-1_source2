export interface Driver {
  id: string;
  name: string;
}

export interface Shift {
  driverId: string;
  startOdometer: number;
  startTime: string; // ISO 8601 date string
  startOdometerImage?: string; // data URL for the image
}

export interface Trip {
  id: string;
  driverId: string;
  startOdometer: number;
  endOdometer: number;
  startTime: string; // ISO 8601 date string
  endTime: string;   // ISO 8601 date string
  startOdometerImage: string; // data URL for the image
  endOdometerImage: string; // data URL for the image
}

export enum View {
    MAIN = 'main',
    CAMERA = 'camera',
    DASHBOARD = 'dashboard'
}