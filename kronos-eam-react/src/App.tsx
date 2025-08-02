import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Plants from './pages/Plants';
import PlantDetail from './pages/PlantDetail';
import RenewableWorkflows from './pages/RenewableWorkflows';
import WorkflowDetail from './pages/WorkflowDetail';
import WorkflowTemplates from './pages/WorkflowTemplates';
import WorkflowTemplateCreator from './pages/WorkflowTemplateCreator';
import WorkflowTemplateEdit from './pages/WorkflowTemplateEdit';
import Agenda from './pages/Agenda';
import ProcessGuide from './pages/ProcessGuide';
import AIAssistant from './pages/AIAssistant';
import Integrations from './pages/Integrations';
import Documents from './pages/Documents';
import Compliance from './pages/Compliance';
import Administration from './pages/Administration';
import UserManagement from './pages/UserManagement';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Profile from './pages/Profile';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "plants",
        element: <Plants />
      },
      {
        path: "plants/:id",
        element: <PlantDetail />
      },
      {
        path: "workflows",
        element: <RenewableWorkflows />
      },
      {
        path: "workflows/:id",
        element: <WorkflowDetail />
      },
      {
        path: "workflow-templates",
        element: <WorkflowTemplates />
      },
      {
        path: "workflow-templates/new",
        element: <WorkflowTemplateCreator />
      },
      {
        path: "workflow-templates/:id/edit",
        element: <WorkflowTemplateEdit />
      },
      {
        path: "agenda",
        element: <Agenda />
      },
      {
        path: "process-guide",
        element: <ProcessGuide />
      },
      {
        path: "ai-assistant",
        element: <AIAssistant />
      },
      {
        path: "integrations",
        element: <Integrations />
      },
      {
        path: "documents",
        element: <Documents />
      },
      {
        path: "compliance",
        element: <Compliance />
      },
      {
        path: "administration",
        element: <Administration />
      },
      {
        path: "admin/users",
        element: <UserManagement />
      },
      {
        path: "notifications",
        element: <Notifications />
      },
      {
        path: "reports",
        element: <Reports />
      },
      {
        path: "team",
        element: <Team />
      },
      {
        path: "profile",
        element: <Profile />
      }
    ]
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;