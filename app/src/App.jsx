import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { UserProvider } from './context/UserContext';
import { ObservationProvider } from './context/ObservationContext';
import { ToastProvider } from './context/ToastContext';
import { PwaLifecycleProvider } from './context/PwaLifecycleContext';
import WelcomePopup from './components/WelcomePopup';
import OnboardingGate from './components/onboarding/OnboardingGate';
import PageErrorBoundary from './components/PageErrorBoundary';

// Lazy load pages for better performance and smaller bundle size
const Home = lazy(() => import('./pages/Home'));
const Library = lazy(() => import('./pages/Library'));
const Tools = lazy(() => import('./pages/Tools'));
const Profile = lazy(() => import('./pages/Profile'));
const MealPlans = lazy(() => import('./pages/MealPlans'));
const Wildlife = lazy(() => import('./pages/Wildlife'));
const Settings = lazy(() => import('./pages/Settings'));
const ManualReader = lazy(() => import('./pages/ManualReader'));
const WizardPage = lazy(() => import('./pages/WizardPage'));
const Cookbook = lazy(() => import('./pages/Cookbook'));
const Feedback = lazy(() => import('./pages/Feedback'));
const HomesteadCommandCenter = lazy(() => import('./pages/HomesteadCommandCenter'));
const GardenPlannerPage = lazy(() => import('./pages/planners/GardenPlannerPage'));
const PantryPlannerPage = lazy(() => import('./pages/planners/PantryPlannerPage'));
const WaterPlannerPage = lazy(() => import('./pages/planners/WaterPlannerPage'));
const EnergyPlannerPage = lazy(() => import('./pages/planners/EnergyPlannerPage'));
const BuildProjectsPage = lazy(() => import('./pages/planners/BuildProjectsPage'));
const FieldBinder = lazy(() => import('./pages/FieldBinder'));

// Loading fallback component
const PageLoader = () => (
    <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-sage-100 border-t-sage-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sage-600 font-serif italic text-lg animate-pulse">Consulting the homestead archives...</p>
    </div>
);

function App() {
    return (
        <ToastProvider>
            <PwaLifecycleProvider>
                <UserProvider>
                    <ObservationProvider>
                        <OnboardingGate />
                        <WelcomePopup />
                        <HashRouter>
                            <PageErrorBoundary>
                                <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                        <Route path="/" element={<Layout />}>
                                            <Route index element={<Home />} />
                                            <Route path="library" element={<Library type="combined" />} />
                                            <Route path="tools" element={<Tools />} />
                                            <Route path="feedback" element={<Feedback />} />
                                            <Route path="meal-plans" element={<MealPlans />} />
                                            <Route path="wildlife" element={<Wildlife />} />
                                            <Route path="profile" element={<Profile />} />
                                            <Route path="settings" element={<Settings />} />
                                            <Route path="manual/:id" element={<ManualReader />} />
                                            <Route path="wizard/:id" element={<WizardPage />} />
                                            <Route path="cookbook" element={<Cookbook />} />
                                            <Route path="homestead" element={<HomesteadCommandCenter />} />
                                            <Route path="homestead/garden-plan" element={<GardenPlannerPage />} />
                                            <Route path="homestead/pantry-plan" element={<PantryPlannerPage />} />
                                            <Route path="homestead/water-plan" element={<WaterPlannerPage />} />
                                            <Route path="homestead/energy-plan" element={<EnergyPlannerPage />} />
                                            <Route path="homestead/build-projects" element={<BuildProjectsPage />} />
                                            <Route path="field-binder" element={<FieldBinder />} />
                                        </Route>
                                    </Routes>
                                </Suspense>
                            </PageErrorBoundary>
                        </HashRouter>
                    </ObservationProvider>
                </UserProvider>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
}

export default App;
