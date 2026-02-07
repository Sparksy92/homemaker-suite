import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Tools from './pages/Tools';
import Profile from './pages/Profile';
import MealPlans from './pages/MealPlans';
import Wildlife from './pages/Wildlife';
import Settings from './pages/Settings';
import { UserProvider } from './context/UserContext';

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="library" element={<Library type="guides" />} />
                        <Route path="reference" element={<Library type="reference" />} />
                        <Route path="tools" element={<Tools />} />
                        <Route path="meal-plans" element={<MealPlans />} />
                        <Route path="wildlife" element={<Wildlife />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;
