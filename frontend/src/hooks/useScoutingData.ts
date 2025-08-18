import { useState, useEffect } from 'react';
import { StartupType } from '@/components/StartupCard';
import { fetchStartups, updateStartupStatus, updateStartupDetails, generateStartupScore, fetchStartupById } from '@/services/startupService';
import { triggerBasicDueDiligence } from '@/services/dueDiligenceService';
import { useToast } from '@/hooks/use-toast';
import { useStartupSync } from '@/hooks/useStartupSync';

export const useScoutingData = () => {
  const [startups, setStartups] = useState<StartupType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStartupId, setEditingStartupId] = useState<string | null>(null);
  const [generatingScoreIds, setGeneratingScoreIds] = useState<Set<string>>(new Set());
  const [generatingBasicDDIds, setGeneratingBasicDDIds] = useState<Set<string>>(new Set());
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set());
  
  const { toast } = useToast();

  // Add startup sync functionality
  const { syncStartups } = useStartupSync({ 
    startups, 
    setStartups, 
    syncInterval: 30000 // Sync every 30 seconds
  });

  useEffect(() => {
    loadStartups();
  }, []);

  const loadStartups = async () => {
    try {
      console.log('Loading startups...');
      const data = await fetchStartups();
      console.log('Loaded startups:', data.map(s => ({ name: s.name, status: s.status })));
      setStartups(data);
    } catch (error) {
      console.error("Failed to load startups:", error);
      toast({
        title: "Error loading startups",
        description: "Could not load startups data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateScore = async (startupId: string) => {
    try {
      setGeneratingScoreIds(prev => new Set(prev).add(startupId));
      const score = await generateStartupScore(startupId);
      
      setStartups(prev => prev.map(startup => 
        startup.id === startupId ? { ...startup, readinessScore: score } : startup
      ));
      
      toast({
        title: "Score Generated",
        description: `Readiness score of ${score}% has been generated.`,
      });
    } catch (error) {
      console.error('Error generating score:', error);
      toast({
        title: "Error",
        description: "Failed to generate readiness score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingScoreIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(startupId);
        return newSet;
      });
    }
  };

  const handleGenerateBasicDD = async (startupId: string) => {
    const startup = startups.find(s => s.id === startupId);
    if (!startup) {
      toast({
        title: "Error",
        description: "Startup not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingBasicDDIds(prev => new Set(prev).add(startupId));
      
      console.log('🚀 Triggering Basic Due Diligence for:', startup.name);
      await triggerBasicDueDiligence(startupId, startup.name);
      
      toast({
        title: "🎉 Basic Due Diligence Started!",
        description: `Analysis has been initiated for ${startup.name}. Our AI analysts are now hard at work creating a comprehensive due diligence report. You'll get notified when it's ready!`,
      });
      
    } catch (error) {
      console.error('❌ Error triggering Basic DD:', error);
      toast({
        title: "Error",
        description: `Failed to start Basic Due Diligence for ${startup.name}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setGeneratingBasicDDIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(startupId);
        return newSet;
      });
    }
  };

  const handleStatusChange = async (startupId: string, status: 'saved' | 'approved' | 'declined') => {
    // Show confirmation for decline action
    if (status === 'declined') {
      const startup = startups.find(s => s.id === startupId);
      if (!window.confirm(`Are you sure you want to decline ${startup?.name}? This will remove it from the main views.`)) {
        return;
      }
    }

    // Store the current state for potential rollback
    const currentStartup = startups.find(s => s.id === startupId);
    const previousStatus = currentStartup?.status;
    
    console.log('🎯 Status change initiated:', { 
      startupId, 
      startupName: currentStartup?.name,
      previousStatus, 
      newStatus: status,
      timestamp: new Date().toISOString()
    });

    try {
      setUpdatingStatusIds(prev => new Set(prev).add(startupId));
      
      // Optimistic update - update UI immediately
      setStartups(prev => prev.map(startup => 
        startup.id === startupId ? { ...startup, status } : startup
      ));
      
      console.log('🔄 Optimistic update applied, calling service...');
      
      // Call the service to update the database
      await updateStartupStatus(startupId, status);
      
      console.log('✅ Database update successful');
      
      // Verify the update by refetching the specific startup
      const updatedStartup = await fetchStartupById(startupId);
      if (updatedStartup && updatedStartup.status === status) {
        console.log('✅ Status verification successful:', { 
          startupId, 
          expectedStatus: status, 
          actualStatus: updatedStartup.status 
        });
        
        // Force a sync to ensure consistency
        setTimeout(() => syncStartups(), 1000);
        
        toast({
          title: "Status Updated",
          description: `Startup has been ${status}.`,
        });
      } else {
        throw new Error(`Status verification failed. Expected: ${status}, Got: ${updatedStartup?.status}`);
      }
      
    } catch (error) {
      console.error('❌ Status update failed:', error);
      
      // Rollback the optimistic update
      console.log('🔄 Rolling back optimistic update...');
      setStartups(prev => prev.map(startup => 
        startup.id === startupId ? { ...startup, status: previousStatus || 'active' } : startup
      ));
      
      toast({
        title: "Error",
        description: `Failed to update startup status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatusIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(startupId);
        return newSet;
      });
    }
  };

  const handleEditDetails = (startupId: string) => {
    setEditingStartupId(startupId);
  };

  const handleSaveDetails = async (startupId: string, updates: Partial<StartupType>) => {
    try {
      await updateStartupDetails(startupId, updates);
      
      setStartups(prev => prev.map(startup => 
        startup.id === startupId ? { ...startup, ...updates } : startup
      ));
      
      setEditingStartupId(null);
      
      toast({
        title: "Details Updated",
        description: "Startup details have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating details:', error);
      toast({
        title: "Error",
        description: "Failed to update startup details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingStartupId(null);
  };

  const handleAddStartup = (newStartup: any) => {
    loadStartups();
  };

  return {
    startups,
    setStartups,
    isLoading,
    editingStartupId,
    generatingScoreIds,
    generatingBasicDDIds,
    updatingStatusIds,
    handleGenerateScore,
    handleGenerateBasicDD,
    handleStatusChange,
    handleEditDetails,
    handleSaveDetails,
    handleCancelEdit,
    handleAddStartup,
    loadStartups
  };
};
