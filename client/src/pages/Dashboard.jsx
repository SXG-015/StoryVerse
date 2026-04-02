import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyAPI, userAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isWriter, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [history, setHistory] = useState([]);
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [storyRes, histRes, favRes] = await Promise.all([
                storyAPI.getAll({ author_id: user.id }),
                userAPI.getHistory(),
                userAPI.getFavourites()
            ]);
            setStories(storyRes.data.stories);
            setHistory(histRes.data.history);
            setFavourites(favRes.data.favourites);
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavourite = async (storyId) => {
        try {
            await userAPI.removeFavourite(storyId);
            setFavourites(favourites.filter(f => f.id !== storyId));
        } catch (err) {
            setError('Failed to remove favourite.');
        }
    };

    const handleBecomeWriter = async () => {
        try {
            await updateProfile({ role: 'writer' });
        } catch (err) {
            setError('Failed to upgrade account.');
        }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm('Are you sure you want to delete this story? This will also delete all its chapters.')) return;
        try {
            await storyAPI.delete(storyId);
            setStories(stories.filter(s => s.id !== storyId));
        } catch (err) {
            setError('Failed to delete story.');
        }
    };

    const getChapterCountText = (count) => {
        const num = parseInt(count) || 0;
        return num === 1 ? '1 chapter' : `${num} chapters`;
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Welcome back, <span className="gradient-text">{user?.display_name || user?.username}</span></h1>
                        <p className="dashboard-subtitle">
                            {isWriter ? 'Manage your stories and chapters' : 'Your reading hub'}
                        </p>
                    </div>
                    {isWriter && (
                        <Link to="/story/new" className="btn btn-primary" id="create-story-btn">
                            ✍️ New Story
                        </Link>
                    )}
                </div>

                {/* Writer upgrade prompt */}
                {!isWriter && (
                    <div className="upgrade-banner" id="upgrade-banner">
                        <div className="upgrade-content">
                            <span className="upgrade-icon">✍️</span>
                            <div>
                                <h3>Want to write stories?</h3>
                                <p>Upgrade your account to start creating and publishing stories.</p>
                            </div>
                        </div>
                        <button onClick={handleBecomeWriter} className="btn btn-primary" id="become-writer-btn">
                            Become a Writer
                        </button>
                    </div>
                )}

                {error && <div className="auth-error">{error}</div>}

                {/* Stats */}
                {isWriter && (
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <span className="stat-number">{stories.length}</span>
                            <span className="stat-label">Total Stories</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">
                                {stories.reduce((acc, s) => acc + (parseInt(s.chapter_count) || 0), 0)}
                            </span>
                            <span className="stat-label">Published Chapters</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-number">
                                {stories.filter(s => s.status === 'ongoing').length}
                            </span>
                            <span className="stat-label">Ongoing</span>
                        </div>
                    </div>
                )}

                {/* Favourites list */}
                {favourites.length > 0 && (
                    <div className="dashboard-section">
                        <h2 className="section-title">Your Favourites</h2>
                        <div className="stories-list">
                            {favourites.map(story => (
                                <div key={story.id} className="story-card-dash">
                                    <div className="story-card-left">
                                        {story.cover_image_url ? (
                                            <img src={story.cover_image_url} alt={story.title} className="story-thumb" />
                                        ) : (
                                            <div className="story-thumb-placeholder"><span>📖</span></div>
                                        )}
                                    </div>
                                    <div className="story-card-info">
                                        <div className="story-card-top">
                                            <Link to={`/story/${story.id}`} className="story-card-title">{story.title}</Link>
                                            <div className="story-card-meta">
                                                <span className="meta-text">{story.genre}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="story-card-actions">
                                        <button onClick={() => navigate(`/story/${story.id}`)} className="btn btn-secondary btn-sm">Read</button>
                                        <button onClick={() => handleRemoveFavourite(story.id)} className="btn btn-danger btn-sm">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* History list */}
                {history.length > 0 && (
                    <div className="dashboard-section">
                        <h2 className="section-title">Reading History</h2>
                        <div className="stories-list">
                            {history.slice(0, 5).map(story => (
                                <div key={story.id} className="story-card-dash">
                                    <div className="story-card-left">
                                        {story.cover_image_url ? (
                                            <img src={story.cover_image_url} alt={story.title} className="story-thumb" />
                                        ) : (
                                            <div className="story-thumb-placeholder"><span>📖</span></div>
                                        )}
                                    </div>
                                    <div className="story-card-info">
                                        <div className="story-card-top">
                                            <Link to={`/story/${story.id}`} className="story-card-title">{story.title}</Link>
                                            <div className="story-card-meta">
                                                <span className="meta-text">Last read: {new Date(story.last_read_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="story-card-actions">
                                        <button onClick={() => navigate(`/story/${story.id}`)} className="btn btn-primary btn-sm">Continue</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stories list */}
                {isWriter && (
                    <div className="dashboard-section">
                        <h2 className="section-title">Your Stories</h2>

                        {loading ? (
                            <div className="loading-screen"><div className="loading-spinner"></div></div>
                        ) : stories.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📝</div>
                                <h3>No stories yet</h3>
                                <p>Start your writing journey by creating your first story.</p>
                                <Link to="/story/new" className="btn btn-primary">Create Your First Story</Link>
                            </div>
                        ) : (
                            <div className="stories-list">
                                {stories.map(story => (
                                    <div key={story.id} className="story-card-dash" id={`story-${story.id}`}>
                                        <div className="story-card-left">
                                            {story.cover_image_url ? (
                                                <img src={story.cover_image_url} alt={story.title} className="story-thumb" />
                                            ) : (
                                                <div className="story-thumb-placeholder">
                                                    <span>📖</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="story-card-info">
                                            <div className="story-card-top">
                                                <Link to={`/story/${story.id}`} className="story-card-title">
                                                    {story.title}
                                                </Link>
                                                <div className="story-card-meta">
                                                    <span className={`badge badge-${story.status}`}>{story.status}</span>
                                                    <span className="meta-dot">·</span>
                                                    <span className="meta-text">{getChapterCountText(story.chapter_count)}</span>
                                                    <span className="meta-dot">·</span>
                                                    <span className="meta-text">{story.genre}</span>
                                                </div>
                                            </div>
                                            {story.description && (
                                                <p className="story-card-desc">{story.description.slice(0, 120)}{story.description.length > 120 ? '...' : ''}</p>
                                            )}
                                        </div>
                                        <div className="story-card-actions">
                                            <button onClick={() => navigate(`/story/${story.id}/edit`)} className="btn btn-secondary btn-sm">Edit</button>
                                            <button onClick={() => navigate(`/story/${story.id}/chapter/new`)} className="btn btn-secondary btn-sm">+ Chapter</button>
                                            <button onClick={() => handleDeleteStory(story.id)} className="btn btn-danger btn-sm">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
