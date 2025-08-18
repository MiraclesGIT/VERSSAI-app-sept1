import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchStartupById } from '@/services/startupService';
import { getStartupProfile, updateStartupProfile, createStartupProfile, StartupProfile } from '@/services/startupProfileService';
import { fetchBasicDueDiligence, fetchDataRoomDueDiligence, BasicDueDiligence, DataRoomDueDiligence, triggerBasicDueDiligence } from '@/services/dueDiligenceService';
import { useToast } from '@/hooks/use-toast';
import { StartupType } from '@/components/StartupCard';
import StartupDetailHeader from '@/components/startup/StartupDetailHeader';
import ElevatorPitchSection from '@/components/startup/ElevatorPitchSection';
import TabbedProfileEditor from '@/components/startup/TabbedProfileEditor';
import StartupFileManager from '@/components/startup/StartupFileManager';
import DataRoomFileManager from '@/components/startup/DataRoomFileManager';
import FloatingActionPanel from '@/components/startup/FloatingActionPanel';
import DueDiligenceOverview from '@/components/startup/DueDiligenceOverview';
import DeleteStartupDialog from '@/components/startup/DeleteStartupDialog';
import UploadDeckModal from '@/components/UploadDeckModal';
import { useStartupDetailUpload } from '@/hooks/useStartupDetailUpload';

const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<StartupType | null>(null);
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [basicDD, setBasicDD] = useState<BasicDueDiligence | null>(null);
  const [dataRoomDD, setDataRoomDD] = useState<DataRoomDueDiligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingBasicDD, setIsGeneratingBasicDD] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  
  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    isUploading,
    uploadProgress,
    handleUploadDeck,
    handleUpload
  } = useStartupDetailUpload(id || '', () => loadData());

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Load startup basic info
      const startupData = await fetchStartupById(id);
      setStartup(startupData);
      
      // Load startup profile
      const profileData = await getStartupProfile(id);
      setProfile(profileData);
      
      // Load due diligence data
      const [basicDDData, dataRoomDDData] = await Promise.all([
        fetchBasicDueDiligence(id),
        fetchDataRoomDueDiligence(id)
      ]);
      
      setBasicDD(basicDDData);
      setDataRoomDD(dataRoomDDData);
      
    } catch (error) {
      console.error('Failed to load startup data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleProfileUpdate = async (updates: Partial<StartupProfile>) => {
    if (!id || !startup) return;
    
    if (profile) {
      // Update existing profile
      await updateStartupProfile(id, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } else {
      // Create new profile
      const newProfile = await createStartupProfile(id, {
        startup_name: startup.name,
        ...updates
      });
      setProfile(newProfile);
    }
  };

  const handleStartupUpdate = () => {
    // Reload startup data to get updated information
    loadData();
  };

  const handleFileUpdate = () => {
    // Reload startup data to get updated file path
    loadData();
  };

  const handleDueDiligenceUpdate = () => {
    // Reload due diligence data
    loadData();
  };

  const handleGenerateBasicDD = async (startupId: string) => {
    if (!startup) {
      toast({
        title: "Error",
        description: "Startup not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingBasicDD(true);
      
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
      setIsGeneratingBasicDD(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!startup) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Startup Detail</h1>
        <div className="bg-card border-border rounded-lg p-6">
          <p className="text-muted-foreground">Startup not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header with key information */}
      <StartupDetailHeader 
        startup={startup} 
        onStartupUpdate={handleStartupUpdate}
        isGeneratingBasicDD={isGeneratingBasicDD}
        onUploadDeck={handleUploadDeck}
        onGenerateBasicDD={handleGenerateBasicDD}
      />
      
      {/* Elevator Pitch - Prominent placement */}
      <ElevatorPitchSection
        startupId={startup.id}
        startupName={startup.name}
        profile={profile}
        onUpdate={handleProfileUpdate}
      />
      
      {/* Due Diligence Overview - Now self-contained with proper alignment */}
      <DueDiligenceOverview
        startupId={startup.id}
        startupName={startup.name}
        deckFilePath={startup.deck_file_path}
        dataRoomFilePaths={startup.data_room_file_paths || []}
        profile={profile}
        basicDD={basicDD}
        dataRoomDD={dataRoomDD}
        onUpdate={handleDueDiligenceUpdate}
      />
      
      {/* Main content grid - Golden ratio layout (62% / 38%) */}
      <div className="grid grid-cols-1 xl:grid-cols-8 gap-6">
        {/* Left column - Company Profile (5/8 ≈ 62.5%) */}
        <div className="xl:col-span-5">
          <TabbedProfileEditor 
            profile={profile} 
            onUpdate={handleProfileUpdate} 
          />
        </div>
        
        {/* Right column - Files and Actions (3/8 = 37.5%) */}
        <div className="xl:col-span-3 space-y-6">
          <StartupFileManager 
            startupId={startup.id}
            deckFilePath={startup.deck_file_path}
            onFileUpdate={handleFileUpdate}
          />
          
          <DataRoomFileManager
            startupId={startup.id}
            dataRoomFilePaths={startup.data_room_file_paths || []}
            onFilesUpdate={handleFileUpdate}
          />
          
          <FloatingActionPanel
            startup={startup}
            profile={profile}
            onUploadDeck={handleUploadDeck}
            onGenerateBasicDD={() => handleGenerateBasicDD(startup.id)}
            onDeleteStartup={() => setShowDeleteDialog(true)}
            isGeneratingBasicDD={isGeneratingBasicDD}
          />
        </div>
      </div>

      {/* Modals */}
      <UploadDeckModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUpload={handleUpload}
        startupId={startup.id}
        isBulkUpload={false}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
      
      <DeleteStartupDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        startupId={startup.id}
        startupName={startup.name}
      />
    </div>
  );
};

export default StartupDetail;
