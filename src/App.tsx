import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { ChatLayout } from './components/ChatLayout';
import { DataSources } from './pages/DataSources';
import { Documentation } from './pages/Documentation';
import { Settings } from './pages/Settings';
import { AgentsDashboard } from './pages/AgentsDashboard';
import { AgentDetails } from './pages/AgentDetails';
import { AgentExtension } from './pages/AgentExtension';
import { Step1SelectTables } from './pages/wizard/Step1SelectTables';
import { Step2PersonaDefinition } from './pages/wizard/Step2PersonaDefinition';
import { Step3RunAnalysis } from './pages/wizard/Step3RunAnalysis';
import { Step4AnalysisValidation } from './pages/wizard/Step4AnalysisValidation';
import { Step5ConfigureRelationships } from './pages/wizard/Step5ConfigureRelationships';
import { Step5SampleQueriesMetrics } from './pages/wizard/Step5SampleQueriesMetrics';
import { Step6ContextReview } from './pages/wizard/Step6ContextReview';
import { Step6ReviewPublish } from './pages/wizard/Step6ReviewPublish';
import { Step8AgentRelationships } from './pages/wizard/Step8AgentRelationships';
import { PublishSuccess } from './pages/wizard/PublishSuccess';
import { ConfigureRelationships } from './pages/ConfigureRelationships';
import { ConfigureGoldenQueries } from './pages/ConfigureGoldenQueries';
import { AgenticChat } from './pages/AgenticChat';
import { ChatDashboard } from './pages/ChatDashboard';
import { ChatWelcome } from './pages/ChatWelcome';
import { Rules } from './pages/Rules';
import SQLWorkbench from './pages/SQLWorkbench';
import DataCatalog from './pages/DataCatalog';
import { useAuthStore } from './lib/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';

// Root redirect - everyone goes to chat home or onboarding
function RootRedirect() {
  const needsOnboarding = useAuthStore((state) => state.needsOnboarding);
  
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Navigate to="/chat" replace />;
}

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } 
        />

        {/* Root redirect based on role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootRedirect />
            </ProtectedRoute>
          }
        />

        {/* All Main Routes with ChatLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          {/* Chat Routes */}
          <Route path="chat" element={<ChatWelcome />} />
          <Route path="chat/new" element={<AgenticChat />} />
          <Route
            path="chat/dashboard"
            element={
              <ProtectedRoute requiredPermission="canAccessChat">
                <ChatDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="chat/:conversationId"
            element={
              <ProtectedRoute requiredPermission="canAccessChat">
                <AgenticChat />
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route path="agents" element={<AgentsDashboard />} />
          <Route path="agents/:agentId" element={<AgentDetails />} />

          {/* Other Routes */}
          <Route path="rules" element={<Rules />} />
          <Route path="sql-workbench" element={<SQLWorkbench />} />
          <Route path="data-catalog" element={<DataCatalog />} />
          <Route
            path="data-sources"
            element={
              <ProtectedRoute requiredPermission="canAccessDataSources">
                <DataSources />
              </ProtectedRoute>
            }
          />
          <Route path="documentation" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Agent Extension - Full Screen (requires edit permission) */}
        <Route
          path="agents/:id/extend"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <AgentExtension />
            </ProtectedRoute>
          }
        />

        {/* Wizard Routes - Full Screen (Create - requires create permission) */}
        <Route
          path="agents/create/step-1"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step1SelectTables />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-2"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step2PersonaDefinition />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-3"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step3RunAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-4"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step4AnalysisValidation />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-5"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step5ConfigureRelationships />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-6"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step5SampleQueriesMetrics />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-7"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step6ContextReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-8"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step6ReviewPublish />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/create/step-9"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <Step8AgentRelationships />
            </ProtectedRoute>
          }
        />

        {/* Edit Agent Routes - Same wizard, pre-filled (requires edit permission) */}
        <Route
          path="agents/:agentId/edit/step-1"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step1SelectTables />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-2"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step2PersonaDefinition />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-3"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step3RunAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-4"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step4AnalysisValidation />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-5"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step5SampleQueriesMetrics />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-6"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step6ContextReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-7"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step6ReviewPublish />
            </ProtectedRoute>
          }
        />
        <Route
          path="agents/:agentId/edit/step-8"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <Step8AgentRelationships />
            </ProtectedRoute>
          }
        />

        {/* Post-Publish Routes (requires create/edit permission) */}
        <Route
          path="publish-success"
          element={
            <ProtectedRoute requiredPermission="canCreateAgents">
              <PublishSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="configure-relationships/:agentId"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <ConfigureRelationships />
            </ProtectedRoute>
          }
        />
        <Route
          path="configure-golden-queries/:agentId"
          element={
            <ProtectedRoute requiredPermission="canEditAgents">
              <ConfigureGoldenQueries />
            </ProtectedRoute>
          }
        />

        {/* Redirect to login if not authenticated, otherwise to home */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
        />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}