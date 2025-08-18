
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { fetchDataRoomDueDiligence } from '@/services/dueDiligenceService';
import { fetchStartupById } from '@/services/startupService';
import DataRoomDueDiligenceSectionViewer from '@/components/startup/DataRoomDueDiligenceSectionViewer';
import DataRoomDueDiligenceFullReport from '@/components/startup/DataRoomDueDiligenceFullReport';
import type { DataRoomDueDiligence } from '@/services/dueDiligenceService';
import type { StartupType } from '@/components/StartupCard';

const DataRoomDueDiligenceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startup, setStartup] = useState<StartupType | null>(null);
  const [dataRoomDD, setDataRoomDD] = useState<DataRoomDueDiligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'sections' | 'full'>('sections');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [startupData, ddData] = await Promise.all([
          fetchStartupById(id),
          fetchDataRoomDueDiligence(id)
        ]);

        setStartup(startupData);
        setDataRoomDD(ddData);

        if (!ddData) {
          toast({
            title: "No Data Room Due Diligence Found",
            description: "This startup doesn't have a data room due diligence report yet.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading data room due diligence:', error);
        toast({
          title: "Error Loading Report",
          description: "Failed to load the data room due diligence report.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, toast]);

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "PDF download functionality will be implemented soon.",
    });
  };

  const handleViewFullReport = () => {
    setActiveView('full');
  };

  const handleBackToSections = () => {
    setActiveView('sections');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-foreground">Loading data room due diligence...</div>
      </div>
    );
  }

  if (!startup || !dataRoomDD) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Data Room Due Diligence Available
            </h3>
            <p className="text-muted-foreground">
              This startup doesn't have a data room due diligence report yet. Upload data room files and generate the analysis first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{startup.name}</h1>
            <p className="text-muted-foreground">Data Room Due Diligence Report</p>
          </div>
        </div>
        
        <Button
          onClick={handleDownloadPDF}
          className="bg-verss-purple hover:bg-verss-purple/80"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Full Report (PDF)
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Data Room Due Diligence Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'sections' | 'full')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sections" className="data-[state=active]:bg-verss-purple data-[state=active]:text-white">
                Section View
              </TabsTrigger>
              <TabsTrigger value="full" className="data-[state=active]:bg-verss-purple data-[state=active]:text-white">
                Full Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="mt-6">
              <DataRoomDueDiligenceSectionViewer
                report={dataRoomDD}
                onViewFullReport={handleViewFullReport}
              />
            </TabsContent>

            <TabsContent value="full" className="mt-6">
              <DataRoomDueDiligenceFullReport
                report={dataRoomDD}
                startupName={startup.name}
                onBackToSections={handleBackToSections}
                onDownloadPDF={handleDownloadPDF}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRoomDueDiligenceDetail;
