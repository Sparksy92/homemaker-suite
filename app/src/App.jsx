import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Tools from './pages/Tools';
import Profile from './pages/Profile';
import MealPlans from './pages/MealPlans';
import Wildlife from './pages/Wildlife';
import Settings from './pages/Settings';
import ManualReader from './pages/ManualReader';
import WizardPage from './pages/WizardPage'; // New Import
import Cookbook from './pages/Cookbook';
import Feedback from './pages/Feedback';
import { UserProvider } from './context/UserContext';
import { ObservationProvider } from './context/ObservationContext';
import WelcomePopup from './components/WelcomePopup';

function App() {
    return (
        <UserProvider>
            <ObservationProvider>
                <WelcomePopup />
                <HashRouter>
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
                            <Route path="wizard/:id" element={<WizardPage />} /> {/* New Route */}
                            <Route path="cookbook" element={<Cookbook />} />
                        </Route>
                    </Routes>
                </HashRouter>
            </ObservationProvider>
        </UserProvider>
    );
}

export default App;
