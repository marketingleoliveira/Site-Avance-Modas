import { useState, useEffect } from 'react';
import { getSiteSetting } from '@/lib/site-settings';

export interface MaintenanceSettings {
  enabled: boolean;
  message?: string;
}

// Cache for maintenance check to avoid excessive DB calls
let maintenanceCache: { enabled: boolean; timestamp: number } | null = null;
const CACHE_TTL = 10000; // 10 seconds

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      // Check cache first
      if (maintenanceCache && Date.now() - maintenanceCache.timestamp < CACHE_TTL) {
        setIsMaintenanceMode(maintenanceCache.enabled);
        setIsLoading(false);
        return;
      }

      try {
        const settings = await getSiteSetting<MaintenanceSettings>('maintenance_settings');
        const enabled = settings?.enabled ?? false;
        
        // Update cache
        maintenanceCache = { enabled, timestamp: Date.now() };
        
        setIsMaintenanceMode(enabled);
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
        setIsMaintenanceMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenance();

    // Recheck periodically
    const interval = setInterval(checkMaintenance, CACHE_TTL);
    return () => clearInterval(interval);
  }, []);

  return { isMaintenanceMode, isLoading };
}

// Function to invalidate cache (called after admin updates setting)
export function invalidateMaintenanceCache() {
  maintenanceCache = null;
}
