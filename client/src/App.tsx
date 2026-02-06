import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Grants from "./pages/Grants";
import GrantDetail from "./pages/GrantDetail";
import ApplyForGrant from "./pages/ApplyForGrant";
import Applications from "./pages/Applications";
import ReviewApplications from "./pages/ReviewApplications";
import EmailPreferences from "./pages/EmailPreferences";
import ManageGrants from "./pages/ManageGrants";
import ApplicationDetail from "./pages/ApplicationDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import ROICalculator from "./pages/ROICalculator";
import PublicDashboard from "./pages/PublicDashboard";
import ExportApplications from "./pages/ExportApplications";
import ExportReviews from "./pages/ExportReviews";
import NotFound from "./pages/NotFound";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/public-dashboard" component={PublicDashboard} />
      <Route path="/grants" component={Grants} />
      <Route path="/grants/:id" component={GrantDetail} />
      <Route path="/grants/:id/apply" component={ApplyForGrant} />
      <Route path="/roi-calculator" component={ROICalculator} />

      {/* Protected Routes */}
      {user && (
        <>
          <Route path="/dashboard" component={() => <DashboardLayout><AdminDashboard /></DashboardLayout>} />
          <Route path="/my-applications" component={() => <DashboardLayout><Applications /></DashboardLayout>} />
          <Route path="/applications/:id" component={() => <DashboardLayout><ApplicationDetail /></DashboardLayout>} />
          <Route path="/review-applications" component={() => <DashboardLayout><ReviewApplications /></DashboardLayout>} />
          <Route path="/email-preferences" component={() => <DashboardLayout><EmailPreferences /></DashboardLayout>} />
          <Route path="/manage-grants" component={() => <DashboardLayout><ManageGrants /></DashboardLayout>} />
          <Route path="/analytics" component={() => <DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/export/applications" component={() => <DashboardLayout><ExportApplications /></DashboardLayout>} />
          <Route path="/export/reviews" component={() => <DashboardLayout><ExportReviews /></DashboardLayout>} />
        </>
      )}

      {/* 404 Route */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
