import { useState, useEffect, useCallback } from 'react';
import { getSiteSetting } from '@/lib/site-settings';
import { updateSiteSetting } from '@/lib/site-settings';

export interface MaintenanceSettings {
  enabled: boolean;
  message?: string;
  scheduled_end?: string | null; // ISO date string
}

// Cache for maintenance check to avoid excessive DB calls
let maintenanceCache: { enabled: boolean; scheduledEnd: string | null; timestamp: number } | null = null;
const CACHE_TTL = 5000; // 5 seconds for more responsive updates

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [scheduledEnd, setScheduledEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkMaintenance = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh && maintenanceCache && Date.now() - maintenanceCache.timestamp < CACHE_TTL) {
      const endDate = maintenanceCache.scheduledEnd ? new Date(maintenanceCache.scheduledEnd) : null;
      
      // Check if scheduled end has passed
      if (maintenanceCache.enabled && endDate && new Date() >= endDate) {
        // Auto-disable maintenance mode
        await updateSiteSetting('maintenance_settings', {
          enabled: false,
          scheduled_end: null
        });
        invalidateMaintenanceCache();
        setIsMaintenanceMode(false);
        setScheduledEnd(null);
        setIsLoading(false);
        return;
      }
      
      setIsMaintenanceMode(maintenanceCache.enabled);
      setScheduledEnd(endDate);
      setIsLoading(false);
      return;
    }

    try {
      const settings = await getSiteSetting<MaintenanceSettings>('maintenance_settings');
      const enabled = settings?.enabled ?? false;
      const endDateStr = settings?.scheduled_end ?? null;
      const endDate = endDateStr ? new Date(endDateStr) : null;
      
      // Check if scheduled end has passed
      if (enabled && endDate && new Date() >= endDate) {
        // Auto-disable maintenance mode
        await updateSiteSetting('maintenance_settings', {
          ...settings,
          enabled: false,
          scheduled_end: null
        });
        invalidateMaintenanceCache();
        setIsMaintenanceMode(false);
        setScheduledEnd(null);
        setIsLoading(false);
        return;
      }
      
      // Update cache
      maintenanceCache = { enabled, scheduledEnd: endDateStr, timestamp: Date.now() };
      
      setIsMaintenanceMode(enabled);
      setScheduledEnd(endDate);
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      setIsMaintenanceMode(false);
      setScheduledEnd(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkMaintenance();

    // Recheck periodically
    const interval = setInterval(() => checkMaintenance(), CACHE_TTL);
    return () => clearInterval(interval);
  }, [checkMaintenance]);

  return { isMaintenanceMode, scheduledEnd, isLoading, refetch: checkMaintenance };
}

// Function to invalidate cache (called after admin updates setting)
export function invalidateMaintenanceCache() {
  maintenanceCache = null;
}
