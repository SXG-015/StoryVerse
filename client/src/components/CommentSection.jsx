import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { storyAPI } from '../services/api';
import './CommentSection.css';

const CommentSection = ({ storyId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [storyId]);

    const fetchComments = async () => {
        try {
            const res = await storyAPI.getComments(storyId);
            setComments(res.data.comments);
        } catch (err) {
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        setSubmitting(true);
        try {
            const res = await storyAPI.addComment(storyId, { content });
            // Add comment to the list, we append it to the end (since query uses ASC)
            setComments(prev => [...prev, {
                ...res.data.comment,
                author_username: user.username,
                author_display_name: user.display_name,
                author_avatar: user.avatar_url,
                author_id: user.id
            }]);
            setContent('');
        } catch (err) {
            setError('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const insertSpoiler = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        
        let newContent;
        if (selectedText) {
            // Wrap selected text
            newContent = content.substring(0, start) + '||' + selectedText + '||' + content.substring(end);
        } else {
            // Insert spoiler template
            newContent = content.substring(0, start) + '||spoiler||' + content.substring(end);
        }
        
        setContent(newContent);
        
        // Restore focus (timeout needed for React state update)
        setTimeout(() => {
            textarea.focus();
            if (selectedText) {
                // select the wrapped text along with the pipes
                textarea.setSelectionRange(start, end + 4);
            } else {
                // position cursor inside the pipes
                textarea.setSelectionRange(start + 2, start + 9);
            }
        }, 0);
    };

    const parseComment = (text) => {
        // Find text between || and wrap in a spoiler span
        const parts = text.split(/(\|\|.*?\|\|)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('||') && part.endsWith('||') && part.length >= 4) {
                const innerText = part.substring(2, part.length - 2);
                return (
                    <span 
                        key={index} 
                        className="spoiler-text"
                        onClick={(e) => e.target.classList.toggle('revealed')}
                    >
                        {innerText}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    if (loading) return <div className="comments-loading">Loading comments...</div>;

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">Comments ({comments.length})</h3>
            
            {error && <div className="comment-error">{error}</div>}

            <div className="comments-list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.author_avatar ? (
                                    <img src={comment.author_avatar} alt={comment.author_display_name} />
                                ) : (
                                    <span className="avatar-fallback">
                                        {(comment.author_display_name || comment.author_username || 'U')[0].toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="comment-content-wrapper">
                                <div className="comment-header">
                                    <span className="comment-author">{comment.author_display_name || comment.author_username}</span>
                                    <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="comment-body">
                                    {parseComment(comment.content)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {user ? (
                <div className="comment-form-container">
                    <form onSubmit={handleSubmit} className="comment-form">
                        <div className="comment-toolbar">
                            <button 
                                type="button" 
                                className="btn-spoiler" 
                                onClick={insertSpoiler}
                                title="Select text and click to blur, or click to insert a spoiler tag"
                            >
                                👁️ Spoiler
                            </button>
                            <span className="toolbar-hint">Use ||text|| to hide spoilers</span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows="4"
                            disabled={submitting}
                            required
                        />
                        <button type="submit" className="btn btn-primary btn-submit-comment" disabled={submitting || !content.trim()}>
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="login-prompt">
                    <p>Log in to leave a comment and share your thoughts.</p>
                </div>
            )}
        </div>
    );
};

export default CommentSection;
