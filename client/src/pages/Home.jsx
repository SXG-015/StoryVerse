import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storyAPI } from '../services/api';
import './Home.css';

const GENRES = ['All', 'Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Drama', 'Comedy', 'General'];

const Home = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [genre, setGenre] = useState('All');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchStories();
    }, [genre, search, pagination.page]);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.page, limit: 12 };
            if (genre !== 'All') params.genre = genre;
            if (search) params.search = search;

            const res = await storyAPI.getAll(params);
            setStories(res.data.stories);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleGenreChange = (g) => {
        setGenre(g);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="home-page">
            {/* Hero section */}
            <section className="hero">
                <div className="hero-content container">
                    <h1 className="hero-title">
                        Discover Stories That
                        <span className="hero-gradient"> Come Alive</span>
                    </h1>
                    <p className="hero-subtitle">
                        Dive into thousands of stories from talented writers around the world.
                        Read, write, and share your imagination.
                    </p>
                    <div className="hero-actions">
                        <form className="hero-search" onSubmit={handleSearch} id="search-form">
                            <input
                                type="text"
                                className="hero-search-input"
                                placeholder="Search stories by title or description..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                id="search-input"
                            />
                            <button type="submit" className="btn btn-primary hero-search-btn" id="search-btn">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
                <div className="hero-glow"></div>
            </section>

            {/* Genre filters */}
            <section className="container">
                <div className="genre-bar" id="genre-bar">
                    {GENRES.map(g => (
                        <button
                            key={g}
                            className={`genre-chip ${genre === g ? 'active' : ''}`}
                            onClick={() => handleGenreChange(g)}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </section>

            {/* Stories grid */}
            <section className="container stories-section">
                <div className="stories-header">
                    <h2>{genre === 'All' ? 'All Stories' : genre}</h2>
                    <span className="stories-count">{pagination.total} {pagination.total === 1 ? 'story' : 'stories'}</span>
                </div>

                {loading ? (
                    <div className="loading-screen"><div className="loading-spinner"></div></div>
                ) : stories.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>No stories found</h3>
                        <p>{search ? 'Try a different search term' : 'Be the first to publish a story!'}</p>
                    </div>
                ) : (
                    <>
                        <div className="stories-grid" id="stories-grid">
                            {stories.map(story => (
                                <Link to={`/story/${story.id}`} key={story.id} className="story-card" id={`story-card-${story.id}`}>
                                    <div className="story-card-cover">
                                        {story.cover_image_url ? (
                                            <img src={story.cover_image_url} alt={story.title} />
                                        ) : (
                                            <div className="story-card-cover-placeholder">
                                                <span>📖</span>
                                            </div>
                                        )}
                                        <div className="story-card-overlay">
                                            <span className={`badge badge-${story.status}`}>{story.status}</span>
                                        </div>
                                    </div>
                                    <div className="story-card-body">
                                        <h3 className="story-card-name">{story.title}</h3>
                                        <p className="story-card-author">by {story.author_display_name || story.author_username}</p>
                                        {story.description && (
                                            <p className="story-card-excerpt">{story.description.slice(0, 80)}{story.description.length > 80 ? '...' : ''}</p>
                                        )}
                                        <div className="story-card-footer">
                                            <span className="story-card-genre">{story.genre}</span>
                                            <span className="story-card-chapters">{story.chapter_count || 0} ch.</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    ← Previous
                                </button>
                                <span className="pagination-info">Page {pagination.page} of {pagination.pages}</span>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page >= pagination.pages}
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Home;
