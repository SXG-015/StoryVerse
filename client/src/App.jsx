import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StoryEditor from './pages/StoryEditor';
import ChapterEditor from './pages/ChapterEditor';
import StoryDetail from './pages/StoryDetail';
import StoryReader from './pages/StoryReader';
import UserProfile from './pages/UserProfile';

import './App.css';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/story/:id" element={<StoryDetail />} />
                                <Route path="/story/:storyId/read/:chapterId" element={<StoryReader />} />
                                <Route path="/profile/:id" element={<UserProfile />} />

                                {/* Protected Routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />

                                {/* Writer-only Routes */}
                                <Route path="/story/new" element={
                                    <ProtectedRoute requireWriter>
                                        <StoryEditor />
                                    </ProtectedRoute>
                                } />
                                <Route path="/story/:id/edit" element={
                                    <ProtectedRoute requireWriter>
                                        <StoryEditor />
                                    </ProtectedRoute>
                                } />
                                <Route path="/story/:storyId/chapter/new" element={
                                    <ProtectedRoute requireWriter>
                                        <ChapterEditor />
                                    </ProtectedRoute>
                                } />
                                <Route path="/story/:storyId/chapter/:chapterId/edit" element={
                                    <ProtectedRoute requireWriter>
                                        <ChapterEditor />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;

