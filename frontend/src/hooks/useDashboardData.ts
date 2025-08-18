
import { useState, useEffect } from 'react';
import { StartupType } from '@/components/StartupCard';
import { fetchStartups } from '@/services/startupService';
import { useToast } from '@/hooks/use-toast';

export const useDashboardData = () => {
  const [startups, setStartups] = useState<StartupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    scoutingStartups: 0,
    startupApplications: 0,
    mostValuableStartups: 0
  });
  const { toast } = useToast();

  const loadStartups = async () => {
    try {
      setLoading(true);
      const data = await fetchStartups();
      setStartups(data);
      
      // Calculate metrics based on the data
      setMetrics({
        scoutingStartups: data.length,
        startupApplications: data.filter(s => s.readinessScore > 50).length,
        mostValuableStartups: data.filter(s => s.readinessScore > 75).length
      });
    } catch (error) {
      console.error('Error loading startups:', error);
      toast({
        title: "Error",
        description: "Failed to load startups data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStartups();
  }, [toast]);

  const refreshData = () => {
    loadStartups();
  };

  return {
    startups,
    loading,
    metrics,
    refreshData
  };
};
