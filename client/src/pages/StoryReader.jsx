import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chapterAPI } from '../services/api';
import './StoryReader.css';

const StoryReader = () => {
    const { storyId, chapterId } = useParams();
    const [chapter, setChapter] = useState(null);
    const [navigation, setNavigation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [fontSize, setFontSize] = useState(18);

    useEffect(() => {
        fetchChapter();
        window.scrollTo(0, 0);
    }, [storyId, chapterId]);

    const fetchChapter = async () => {
        setLoading(true);
        try {
            const res = await chapterAPI.getById(storyId, chapterId);
            setChapter(res.data.chapter);
            setNavigation(res.data.navigation);
        } catch (err) {
            setError(err.response?.data?.error || 'Chapter not found.');
        } finally {
            setLoading(false);
        }
    };

    const adjustFontSize = (delta) => {
        setFontSize(prev => Math.max(14, Math.min(28, prev + delta)));
    };

    if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
    if (error) return <div className="loading-screen"><p>{error}</p></div>;
    if (!chapter) return null;

    return (
        <div className="reader-page">
            {/* Reader top bar */}
            <div className="reader-topbar">
                <div className="reader-topbar-inner">
                    <Link to={`/story/${storyId}`} className="reader-back">
                        ← {chapter.story_title}
                    </Link>
                    <div className="reader-controls">
                        <button className="reader-control-btn" onClick={() => adjustFontSize(-2)} title="Decrease font size" id="font-decrease">
                            A-
                        </button>
                        <span className="reader-font-size">{fontSize}px</span>
                        <button className="reader-control-btn" onClick={() => adjustFontSize(2)} title="Increase font size" id="font-increase">
                            A+
                        </button>
                    </div>
                </div>
            </div>

            {/* Reading area */}
            <article className="reader-content" id="reader-content">
                <header className="reader-header">
                    <span className="reader-chapter-num">Chapter {navigation?.current || ''}</span>
                    <h1 className="reader-title">{chapter.title}</h1>
                    <div className="reader-meta">
                        <span>by {chapter.author_display_name || chapter.author_username}</span>
                        <span>·</span>
                        <span>{chapter.word_count?.toLocaleString() || 0} words</span>
                    </div>
                </header>

                <div
                    className="reader-body"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
            </article>

            {/* Chapter navigation */}
            <nav className="reader-nav">
                <div className="reader-nav-inner">
                    {navigation?.previous ? (
                        <Link to={`/story/${storyId}/read/${navigation.previous.id}`} className="reader-nav-btn reader-nav-prev" id="prev-chapter">
                            <span className="nav-direction">← Previous</span>
                            <span className="nav-chapter-name">{navigation.previous.title}</span>
                        </Link>
                    ) : (
                        <div></div>
                    )}
                    {navigation?.next ? (
                        <Link to={`/story/${storyId}/read/${navigation.next.id}`} className="reader-nav-btn reader-nav-next" id="next-chapter">
                            <span className="nav-direction">Next →</span>
                            <span className="nav-chapter-name">{navigation.next.title}</span>
                        </Link>
                    ) : (
                        <div className="reader-end-message">
                            <p>🎉 You've reached the end!</p>
                            <Link to={`/story/${storyId}`} className="btn btn-secondary btn-sm">Back to Story</Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default StoryReader;
