import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Layout } from './components/Layout';
import { AgentsDashboard } from './pages/AgentsDashboard';
import { AgentDetails } from './pages/AgentDetails';
import { DataSources } from './pages/DataSources';
import { Documentation } from './pages/Documentation';
import { Settings } from './pages/Settings';
import { Step1SelectTables } from './pages/wizard/Step1SelectTables';
import { Step2PersonaDefinition } from './pages/wizard/Step2PersonaDefinition';
import { Step3RunAnalysis } from './pages/wizard/Step3RunAnalysis';
import { Step4AnalysisValidation } from './pages/wizard/Step4AnalysisValidation';
import { Step5SampleQueriesMetrics } from './pages/wizard/Step5SampleQueriesMetrics';
import { Step6ReviewPublish } from './pages/wizard/Step6ReviewPublish';
import { PublishSuccess } from './pages/wizard/PublishSuccess';
import { ConfigureRelationships } from './pages/ConfigureRelationships';
import { ConfigureGoldenQueries } from './pages/ConfigureGoldenQueries';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AgentsDashboard />} />
          <Route path="agents/:agentId" element={<AgentDetails />} />
          <Route path="data-sources" element={<DataSources />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Wizard Routes - Full Screen */}
        <Route path="agents/create/step-1" element={<Step1SelectTables />} />
        <Route path="agents/create/step-2" element={<Step2PersonaDefinition />} />
        <Route path="agents/create/step-3" element={<Step3RunAnalysis />} />
        <Route path="agents/create/step-4" element={<Step4AnalysisValidation />} />
        <Route path="agents/create/step-5" element={<Step5SampleQueriesMetrics />} />
        <Route path="agents/create/step-6" element={<Step6ReviewPublish />} />
        
        {/* Post-Publish Routes */}
        <Route path="publish-success" element={<PublishSuccess />} />
        <Route path="configure-relationships/:agentId" element={<ConfigureRelationships />} />
        <Route path="configure-golden-queries/:agentId" element={<ConfigureGoldenQueries />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
