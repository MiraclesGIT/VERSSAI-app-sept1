
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { fetchStartupById } from '@/services/startupService';
import { getStartupProfile, StartupProfile } from '@/services/startupProfileService';
import { StartupType } from '@/components/StartupCard';
import DueDiligenceReport from '@/components/startup/DueDiligenceReport';

const MicroDueDiligenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<StartupType | null>(null);
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const [startupData, profileData] = await Promise.all([
          fetchStartupById(id),
          getStartupProfile(id)
        ]);
        
        setStartup(startupData);
        setProfile(profileData);
        
      } catch (error) {
        console.error('Failed to load micro due diligence data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!startup || !profile || (!profile.micro_due_diligence_html && !profile.micro_due_diligence_markdown)) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/startup/${id}`)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Startup Details
        </Button>
        
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Micro Due Diligence Available</h2>
            <p className="text-muted-foreground mb-6">
              The micro due diligence report for {startup?.name} is not available yet.
            </p>
            <Button
              onClick={() => navigate(`/startup/${id}`)}
              className="bg-verss-purple hover:bg-verss-purple/80"
            >
              Return to Startup Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate(`/startup/${id}`)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Startup Details
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-6 h-6" />
              Micro Due Diligence Report - {startup.name}
            </CardTitle>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
              Completed
            </Badge>
          </div>
          
          {(profile.micro_due_diligence_created_at || profile.micro_due_diligence_updated_at) && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
              {profile.micro_due_diligence_created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(profile.micro_due_diligence_created_at)}</span>
                </div>
              )}
              {profile.micro_due_diligence_updated_at && 
               profile.micro_due_diligence_updated_at !== profile.micro_due_diligence_created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated: {formatDate(profile.micro_due_diligence_updated_at)}</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <DueDiligenceReport
            htmlContent={profile.micro_due_diligence_html}
            markdownContent={profile.micro_due_diligence_markdown}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroDueDiligenceDetail;
