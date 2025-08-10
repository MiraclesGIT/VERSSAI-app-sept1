import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import FounderSignalFit from "./components/FounderSignalFit";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" 
              alt="VERSSAI Logo"
              className="w-16 h-16 rounded-lg shadow-lg"
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">VERSSAI</h1>
          <p className="text-xl text-gray-600 mb-8">VC Intelligence Platform</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Leverage AI to analyze founders, conduct due diligence, manage portfolios, 
            and optimize investment decisions with research-backed insights.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link 
            to="/founder-signal" 
            className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Founder Signal Fit</h3>
            <p className="text-gray-600 text-sm">
              Upload pitch decks to analyze founder-market fit using AI-powered signals and LinkedIn enrichment
            </p>
            <div className="mt-4 text-blue-600 text-sm font-medium group-hover:text-blue-700">
              Get Started →
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 opacity-60">
            <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Due Diligence</h3>
            <p className="text-gray-500 text-sm">
              AI-powered document analysis and risk assessment for comprehensive due diligence
            </p>
            <div className="mt-4 text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 opacity-60">
            <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Portfolio Management</h3>
            <p className="text-gray-500 text-sm">
              RAG-based portfolio tracking with meeting notes, OKRs, and KPI monitoring
            </p>
            <div className="mt-4 text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="grid grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-blue-600">1,157</div>
              <div className="text-xs text-gray-500">Research Papers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">82%</div>
              <div className="text-xs text-gray-500">AI Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">7.23x</div>
              <div className="text-xs text-gray-500">Target ROI</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">32</div>
              <div className="text-xs text-gray-500">Verified Papers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/founder-signal" element={<FounderSignalFit />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
