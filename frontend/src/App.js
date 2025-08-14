import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DealProvider } from "./contexts/DealContext";
import WorkspaceHeader from "./components/WorkspaceHeader";
import DealPipeline from "./components/DealPipeline";
import AnalysisWorkflow from "./components/AnalysisWorkflow";
// Keep legacy components for backward compatibility
import FounderSignalFit from "./components/FounderSignalFit";
import DueDiligenceDataRoom from "./components/DueDiligenceDataRoom";
import PortfolioManagement from "./components/PortfolioManagement";
import FundAssessment from "./components/FundAssessment";
import FundAllocation from "./components/FundAllocation";
import FundVintage from "./components/FundVintage";

function App() {
  return (
    <div className="App">
      <DealProvider>
        <BrowserRouter>
          <WorkspaceHeader />
          <Routes>
            {/* New workspace interface */}
            <Route path="/" element={<DealPipeline />} />
            <Route path="/deal/:dealId" element={<AnalysisWorkflow />} />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="/founder-signal" element={<FounderSignalFit />} />
            <Route path="/due-diligence" element={<DueDiligenceDataRoom />} />
            <Route path="/portfolio" element={<PortfolioManagement />} />
            <Route path="/fund-assessment" element={<FundAssessment />} />
            <Route path="/fund-allocation" element={<FundAllocation />} />
            <Route path="/fund-vintage" element={<FundVintage />} />
          </Routes>
        </BrowserRouter>
      </DealProvider>
    </div>
  );
}

export default App;