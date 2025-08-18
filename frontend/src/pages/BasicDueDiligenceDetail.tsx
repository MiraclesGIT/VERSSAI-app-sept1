
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { fetchBasicDueDiligenceReport, BasicDueDiligenceReport, generateBasicDueDiligencePDF } from '@/services/basicDueDiligenceService';
import { fetchStartupById } from '@/services/startupService';
import { StartupType } from '@/components/StartupCard';
import DueDiligenceSectionViewer from '@/components/startup/DueDiligenceSectionViewer';
import DueDiligenceFullReport from '@/components/startup/DueDiligenceFullReport';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'sections' | 'full';

const BasicDueDiligenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<BasicDueDiligenceReport | null>(null);
  const [startup, setStartup] = useState<StartupType | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('sections');
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Load startup and report data
        const [startupData, reportData] = await Promise.all([
          fetchStartupById(id),
          fetchBasicDueDiligenceReport(id)
        ]);
        
        setStartup(startupData);
        setReport(reportData);
        
        if (!reportData) {
          toast({
            title: "Report Not Found",
            description: "Basic due diligence report not available for this startup.",
            variant: "destructive",
          });
          navigate(`/startup/${id}`);
        }
        
      } catch (error) {
        console.error('Failed to load basic due diligence report:', error);
        toast({
          title: "Error",
          description: "Failed to load basic due diligence report.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, toast]);

  const handleDownloadPDF = async () => {
    if (!report) return;
    
    try {
      setDownloadingPDF(true);
      
      const pdfBlob = await generateBasicDueDiligencePDF(report);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `basic-due-diligence-${report.startup_name.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated",
        description: "The report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleViewFullReport = () => {
    setViewMode('full');
  };

  const handleBackToSections = () => {
    setViewMode('sections');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report || !startup) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/startup/${id}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Startup
          </Button>
        </div>
        <div className="bg-card border-border rounded-lg p-6">
          <p className="text-muted-foreground">Basic due diligence report not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header - only show when in sections view */}
      {viewMode === 'sections' && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/startup/${id}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Startup
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Basic Due Diligence Report</h1>
              <p className="text-muted-foreground">{startup.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'sections' ? (
        <DueDiligenceSectionViewer
          report={report}
          onViewFullReport={handleViewFullReport}
        />
      ) : (
        <DueDiligenceFullReport
          report={report}
          onBackToSections={handleBackToSections}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </div>
  );
};

export default BasicDueDiligenceDetail;
