import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyAPI, userAPI } from '../services/api';
import CommentSection from '../components/CommentSection';
import './StoryDetail.css';

const StoryDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavourite, setIsFavourite] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchStory();
        if (user) {
            userAPI.updateHistory(id).catch(console.error);
            checkIfFavourite();
        }
    }, [id, user]);

    const checkIfFavourite = async () => {
        try {
            const res = await userAPI.getFavourites();
            setIsFavourite(res.data.favourites.some(f => f.id === id));
        } catch (err) {
            console.error('Failed to fetch favourites', err);
        }
    };

    const toggleFavourite = async () => {
        if (!user) return;
        setActionLoading(true);
        try {
            if (isFavourite) {
                await userAPI.removeFavourite(id);
                setIsFavourite(false);
            } else {
                await userAPI.addFavourite(id);
                setIsFavourite(true);
            }
        } catch (err) {
            console.error('Failed to toggle favourite', err);
        } finally {
            setActionLoading(false);
        }
    };

    const fetchStory = async () => {
        try {
            const res = await storyAPI.getById(id);
            setStory(res.data.story);
            setChapters(res.data.chapters);
        } catch (err) {
            setError('Story not found.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
    if (error) return <div className="loading-screen"><p>{error}</p></div>;
    if (!story) return null;

    const isOwner = user && user.id === story.author_id;
    const publishedChapters = chapters.filter(c => c.status === 'published');

    return (
        <div className="story-detail-page">
            <div className="container">
                {/* Story header */}
                <div className="story-detail-header">
                    <div className="story-detail-cover">
                        {story.cover_image_url ? (
                            <img src={story.cover_image_url} alt={story.title} />
                        ) : (
                            <div className="story-detail-cover-placeholder">
                                <span>📖</span>
                            </div>
                        )}
                    </div>
                    <div className="story-detail-info">
                        <div className="story-detail-badges">
                            <span className={`badge badge-${story.status}`}>{story.status}</span>
                            <span className="badge badge-ongoing">{story.genre}</span>
                        </div>
                        <h1 className="story-detail-title">{story.title}</h1>
                        <Link to={`/profile/${story.author_id}`} className="story-detail-author">
                            <span className="author-avatar-sm">
                                {story.author_avatar ? (
                                    <img src={story.author_avatar} alt={story.author_display_name} />
                                ) : (
                                    <span className="avatar-fallback">{(story.author_display_name || story.author_username || 'U')[0].toUpperCase()}</span>
                                )}
                            </span>
                            <span className="author-name">{story.author_display_name || story.author_username}</span>
                        </Link>
                        {story.description && (
                            <p className="story-detail-desc">{story.description}</p>
                        )}
                        <div className="story-detail-stats">
                            <div className="detail-stat">
                                <span className="detail-stat-num">{publishedChapters.length}</span>
                                <span className="detail-stat-label">Chapters</span>
                            </div>
                            <div className="detail-stat">
                                <span className="detail-stat-num">
                                    {chapters.reduce((sum, c) => sum + (c.word_count || 0), 0).toLocaleString()}
                                </span>
                                <span className="detail-stat-label">Words</span>
                            </div>
                        </div>
                        <div className="story-detail-actions">
                            {publishedChapters.length > 0 && (
                                <Link to={`/story/${id}/read/${publishedChapters[0].id}`} className="btn btn-primary btn-lg">
                                    📖 Start Reading
                                </Link>
                            )}
                            {user && (
                                <button 
                                    className={`btn ${isFavourite ? 'btn-primary' : 'btn-secondary'}`} 
                                    onClick={toggleFavourite} 
                                    disabled={actionLoading}
                                >
                                    {isFavourite ? '★ Favourited' : '☆ Favourite'}
                                </button>
                            )}
                            {isOwner && (
                                <>
                                    <Link to={`/story/${id}/edit`} className="btn btn-secondary">Edit</Link>
                                    <Link to={`/story/${id}/chapter/new`} className="btn btn-secondary">+ Chapter</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chapters list */}
                <div className="chapters-section">
                    <h2 className="section-title">Chapters</h2>
                    {chapters.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>No chapters yet</h3>
                            <p>{isOwner ? 'Start adding chapters to your story.' : 'This story has no published chapters yet.'}</p>
                            {isOwner && (
                                <Link to={`/story/${id}/chapter/new`} className="btn btn-primary">Write First Chapter</Link>
                            )}
                        </div>
                    ) : (
                        <div className="chapters-list">
                            {chapters.map((chapter, index) => (
                                <div key={chapter.id} className="chapter-item" id={`chapter-${chapter.id}`}>
                                    <div className="chapter-number">{chapter.chapter_order}</div>
                                    <div className="chapter-content">
                                        <div className="chapter-top">
                                            {chapter.status === 'published' ? (
                                                <Link to={`/story/${id}/read/${chapter.id}`} className="chapter-link">
                                                    {chapter.title}
                                                </Link>
                                            ) : (
                                                <span className="chapter-link chapter-draft-title">{chapter.title}</span>
                                            )}
                                            <span className={`badge badge-${chapter.status}`}>{chapter.status}</span>
                                        </div>
                                        <div className="chapter-meta">
                                            <span>{chapter.word_count?.toLocaleString() || 0} words</span>
                                            <span>·</span>
                                            <span>{new Date(chapter.updated_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <Link to={`/story/${id}/chapter/${chapter.id}/edit`} className="btn btn-secondary btn-sm">
                                            Edit
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <CommentSection storyId={id} />
                
            </div>
        </div>
    );
};

export default StoryDetail;
