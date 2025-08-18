
import { useEffect, useCallback } from 'react';
import { fetchStartups } from '@/services/startupService';
import { StartupType } from '@/components/StartupCard';

interface UseStartupSyncProps {
  startups: StartupType[];
  setStartups: (startups: StartupType[]) => void;
  syncInterval?: number; // in milliseconds
}

export const useStartupSync = ({ 
  startups, 
  setStartups, 
  syncInterval = 30000 // 30 seconds default
}: UseStartupSyncProps) => {
  
  const syncStartups = useCallback(async () => {
    try {
      console.log('🔄 Syncing startups with database...');
      const freshData = await fetchStartups();
      
      // Check if there are any differences
      const hasChanges = JSON.stringify(startups.map(s => ({ id: s.id, status: s.status }))) !== 
                        JSON.stringify(freshData.map(s => ({ id: s.id, status: s.status })));
      
      if (hasChanges) {
        console.log('📊 Startup data has changed, updating local state');
        setStartups(freshData);
      } else {
        console.log('✅ Startup data is in sync');
      }
    } catch (error) {
      console.error('❌ Failed to sync startups:', error);
    }
  }, [startups, setStartups]);

  useEffect(() => {
    const interval = setInterval(syncStartups, syncInterval);
    
    // Also sync when the page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncStartups();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncStartups, syncInterval]);

  return { syncStartups };
};
