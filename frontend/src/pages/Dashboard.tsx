
import React, { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import IndustryTrends from '@/components/dashboard/IndustryTrends';
import DashboardInsights from '@/components/dashboard/DashboardInsights';
import UploadDeckModal from '@/components/UploadDeckModal';
import EmptyDashboardState from '@/components/dashboard/EmptyDashboardState';

const Dashboard = () => {
  const { startups, loading, metrics } = useDashboardData();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUpload = (files: File[]) => {
    // Handle file upload logic here
    console.log('Files uploaded:', files);
    setShowUploadModal(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-card rounded-lg"></div>
            <div className="h-64 bg-card rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no startups
  if (startups.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your startup scouting command center</p>
        </div>
        
        <EmptyDashboardState onUploadClick={() => setShowUploadModal(true)} />
        
        <UploadDeckModal 
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          onUpload={handleUpload}
          isBulkUpload={true}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Your startup scouting command center</p>
      </div>
      
      <DashboardMetrics metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndustryTrends startups={startups} />
        <DashboardInsights startups={startups} />
      </div>
    </div>
  );
};

export default Dashboard;
