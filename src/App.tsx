import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import NavbarGold from "@/components/NavbarGold";
import ClusterScreen from "@/components/ClusterScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AccessibilityFab } from "@/components/accessibility/AccessibilityFab";
import { CaptionBar } from "@/components/accessibility/CaptionBar";
import { useAccessibilityStore } from "@/store/accessibilityStore";
import { useUserStore } from "@/store/userStore";
import { initializeAuth } from "@/services/authService";
import { supabase } from "@/lib/supabase";
import { Suspense } from "react";
import { NAVIGATION_CLUSTERS } from "@/config/navigationClusters";
import { useNavigationStore } from "@/store/navigationStore";
import { ClusterType } from "@/types/navigation";

import LandingGold from "./pages/LandingGold";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DashboardGold from "./pages/DashboardGold";
import AIBot from "./pages/AIBot";
import Browser from "./pages/Browser";
import Roadmap from "./pages/Roadmap";
import Notes from "./pages/Notes";
import FocusRoom from "./pages/FocusRoom";
import StudyVR from "./pages/StudyVR";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Opportunities from "./pages/Opportunities";
import NotFound from "./pages/NotFound";
import StudyPlanner from "./pages/StudyPlanner";
import StudyGroups from "./pages/StudyGroups";
import Workspace from "./pages/Workspace";
import SmartDeadline from "./pages/SmartDeadline";
import KnowledgeOrbit from "./pages/KnowledgeOrbit";
import GameHub from "./pages/GameHub";
import GameDetail from "./pages/GameDetail";
import GameCompetitionLobby from "./pages/GameCompetitionLobby";
import GameMatchResults from "./pages/GameMatchResults";
import PerformanceTiers from "./pages/PerformanceTiers";
import Wellness from "./pages/Wellness";
import SignLanguage from "./pages/SignLanguage";
import SignLanguageSetup from "./pages/SignLanguageSetup";
import SignLanguageLesson from "./pages/SignLanguageLesson";
import SignLanguageTranslator from "./pages/SignLanguageTranslator";
import PracticeMode from "./pages/PracticeMode";
import SignLanguageTutor from "./pages/SignLanguageTutor";
import UnifiedOS from "./pages/UnifiedOS";
import CreateSpace from "./pages/CreateSpace";
import WorkspaceLayout from "./pages/WorkspaceLayout";
import WorkspaceView from "./pages/WorkspaceView";
import Friends from "./pages/Friends";
import StudyTogether from "./pages/StudyTogether";
import { TaskManager } from "./components/tasks/TaskManager";
import Sidebar from "./components/Sidebar";
import { useSidebarStore } from "./store/sidebarStore";
import { useMusicPlayerStore } from "./store/musicPlayerStore";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticatedRef = useRef(false);

  useEffect(() => {
    // Initialize auth state on app load (only once)
    initializeAuth().then(() => {
      isAuthenticatedRef.current = useUserStore.getState().isAuthenticated;
    });

    // Handle OAuth callback explicitly
    const handleOAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        // Give Supabase time to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Trigger auth initialization
          await initializeAuth();
          isAuthenticatedRef.current = true;
        }
      }
    };

    handleOAuthCallback();

    // Listen for auth state changes (OAuth callback, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      if (event === 'SIGNED_IN' && session) {
        // Prevent duplicate sign-in processing
        if (isAuthenticatedRef.current) {

          return;
        }

        const userName = session.user.user_metadata?.name ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split('@')[0] ||
          'User';

        // Immediately update store and redirect - don't wait for profile
        const userStoreData = {
          id: session.user.id,
          name: userName,
          email: session.user.email!,
          xp: 0,
          level: 1,
          streak: 0,
        };

        useUserStore.getState().login(session.user.email!, userName);
        useUserStore.setState({
          isAuthenticated: true,
          user: userStoreData,
        });

        isAuthenticatedRef.current = true;

        // Only navigate to dashboard if user is on login/register page or landing
        const currentPath = window.location.pathname;
        const isPublicPage = ['/', '/login', '/register'].includes(currentPath);
        if (isPublicPage) {
          navigate('/dashboard', { replace: true });
        }

        // Fetch/create profile in background (don't block redirect)
        setTimeout(async () => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              useUserStore.setState({
                user: {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  xp: profile.xp,
                  level: profile.level,
                  streak: profile.streak,
                },
              });
            } else if (profileError?.code === 'PGRST116') {
              await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email!,
                  name: userName,
                  xp: 0,
                  level: 1,
                  streak: 0,
                });
            }
          } catch (error) {
            console.error('Profile sync error:', error);
            // Silent fail - user is already authenticated
          }
        }, 100);
      } else if (event === 'SIGNED_OUT') {

        useUserStore.getState().logout();
        isAuthenticatedRef.current = false;
        navigate('/login', { replace: true });
      } else if (event === 'TOKEN_REFRESHED') {

        // Token refresh is automatic, no action needed
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]); // Add navigate to deps

  return null;
}

function ClusterRouteHandler() {
  const location = useLocation();
  const clusterId = location.pathname.split('/')[2]; // Extract clusterId from /cluster/:clusterId

  const setActiveCluster = useNavigationStore((state) => state.setActiveCluster);
  const setIsInCluster = useNavigationStore((state) => state.setIsInCluster);

  useEffect(() => {
    if (clusterId) {
      setActiveCluster(clusterId as ClusterType);
      setIsInCluster(true);
    }
    return () => {
      setActiveCluster(null);
      setIsInCluster(false);
    };
  }, [clusterId, setActiveCluster, setIsInCluster]);

  const cluster = NAVIGATION_CLUSTERS[clusterId as keyof typeof NAVIGATION_CLUSTERS];

  if (!cluster) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ClusterScreen cluster={cluster} />;
}

function ConditionalLayout() {
  const location = useLocation();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const isMinimized = useMusicPlayerStore((state) => state.isMinimized);

  // Pages where navbar and sidebar should be hidden (auth pages & clusters only)
  const hideNavbar = ['/', '/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname) ||
    location.pathname.startsWith('/cluster');

  const showSidebar = isAuthenticated && !hideNavbar;

  return (
    <div className="flex min-h-screen bg-[#0C0E17]">
      {/* Persistent Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${showSidebar ? (isCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
        {!hideNavbar && <NavbarGold />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingGold />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<Login />} />

            {/* Cluster Routes */}
            <Route
              path="/cluster/:clusterId"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <ClusterRouteHandler />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <DashboardGold />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/ai-bot"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <AIBot />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Roadmap />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/notes"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Notes />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/study-groups"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <StudyGroups />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/browser"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Browser />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/focus-room"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <FocusRoom />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/study-vr"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <StudyVR />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/courses"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Courses />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/courses/:courseId"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/sign-language"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SignLanguage />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/sign-language/setup"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SignLanguageSetup />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/sign-language/lesson"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SignLanguageLesson />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/sign-language/translator"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SignLanguageTranslator />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/sign-language/practice"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <PracticeMode />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/sign-language/tutor"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SignLanguageTutor />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/community"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/profile"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/study-planner"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <StudyPlanner />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/workspace"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Workspace />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/workspace/:workspaceType"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <WorkspaceView />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/tasks"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <TaskManager />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/smart-deadline"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <SmartDeadline />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />

            <Route
              path="/knowledge-orbit"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <KnowledgeOrbit />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/game-hub"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <GameHub />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/game-hub/:gameId"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <GameDetail />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/game-hub/:gameId/lobby"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <GameCompetitionLobby />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/game-hub/:gameId/results"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <GameMatchResults />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/performance-tiers"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <PerformanceTiers />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/opportunities"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Opportunities />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/wellness"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Wellness />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />


            <Route
              path="/friends"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/study-together"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <StudyTogether />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/unified-os"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <UnifiedOS />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/workspaces"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <UnifiedOS />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/unified-os/create"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <CreateSpace />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/workspaces/create"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <CreateSpace />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/unified-os/workspace/:spaceId"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <WorkspaceLayout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route
              path="/workspaces/workspace/:spaceId"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <WorkspaceLayout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const App = () => {
  const { dyslexiaFont, textScale, highContrast, colorblindMode } = useAccessibilityStore();

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Dyslexia font - apply to body for better cascade
    if (dyslexiaFont) {
      body.classList.add('dyslexia-font');
      root.style.fontFamily = 'Comic Sans MS, Verdana, sans-serif';
    } else {
      body.classList.remove('dyslexia-font');
      root.style.fontFamily = '';
    }

    // Text scale
    root.style.fontSize = `${textScale}%`;

    // High contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Colorblind filters
    const filters = {
      none: '',
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)',
    };
    root.style.filter = filters[colorblindMode];
  }, [dyslexiaFont, textScale, highContrast, colorblindMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TranslationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-[#0C0E17]">
                <div className="text-center">
                  <div className="mb-4 text-6xl font-black bg-gradient-to-r from-[#BF5AF2] via-[#FF6EC7] to-[#BF5AF2] bg-clip-text text-transparent animate-pulse">Learnify</div>
                  <div className="text-white/60">Loading your learning universe...</div>
                </div>
              </div>
            }>
              <BrowserRouter>
                <AuthListener />
                <ConditionalLayout />
                <AccessibilityFab />
                <CaptionBar />
              </BrowserRouter>
            </Suspense>
          </TooltipProvider>
        </TranslationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;


