import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import Tools from './pages/Tools';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="library" element={<Library />} />
                    <Route path="tools" element={<Tools />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
