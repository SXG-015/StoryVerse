import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyAPI } from '../services/api';
import './Editor.css';

const GENRES = ['General', 'Fantasy', 'Romance', 'Sci-Fi', 'Mystery', 'Thriller', 'Horror', 'Adventure', 'Drama', 'Comedy'];

const StoryEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: 'General',
        cover_image_url: '',
        status: 'ongoing',
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchStory();
        }
    }, [id]);

    const fetchStory = async () => {
        setLoading(true);
        try {
            const res = await storyAPI.getById(id);
            const s = res.data.story;
            setFormData({
                title: s.title,
                description: s.description || '',
                genre: s.genre || 'General',
                cover_image_url: s.cover_image_url || '',
                status: s.status || 'ongoing',
            });
        } catch (err) {
            setError('Failed to load story.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            if (isEditing) {
                await storyAPI.update(id, formData);
                navigate(`/story/${id}`);
            } else {
                const res = await storyAPI.create(formData);
                navigate(`/story/${res.data.story.id}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save story.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="editor-page">
            <div className="editor-container">
                <div className="editor-header">
                    <h1>{isEditing ? 'Edit Story' : 'Create New Story'}</h1>
                    <p className="editor-subtitle">
                        {isEditing ? 'Update your story details' : 'Set up your story — you can add chapters after creating it'}
                    </p>
                </div>

                {error && (
                    <div className="auth-error">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="editor-form" id="story-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="title">Story Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-input form-input-lg"
                            placeholder="Give your story a captivating title..."
                            value={formData.title}
                            onChange={handleChange}
                            required
                            maxLength={200}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-textarea"
                            placeholder="Hook your readers with a compelling description..."
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    <div className="form-row-editor">
                        <div className="form-group">
                            <label className="form-label" htmlFor="genre">Genre</label>
                            <select
                                id="genre"
                                name="genre"
                                className="form-select"
                                value={formData.genre}
                                onChange={handleChange}
                            >
                                {GENRES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        {isEditing && (
                            <div className="form-group">
                                <label className="form-label" htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="cover_image_url">Cover Image URL</label>
                        <input
                            type="url"
                            id="cover_image_url"
                            name="cover_image_url"
                            className="form-input"
                            placeholder="https://example.com/cover.jpg"
                            value={formData.cover_image_url}
                            onChange={handleChange}
                        />
                        {formData.cover_image_url && (
                            <div className="cover-preview">
                                <img src={formData.cover_image_url} alt="Cover preview" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}
                    </div>

                    <div className="editor-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg" id="save-story-btn" disabled={saving}>
                            {saving ? (
                                <><span className="loading-spinner-sm"></span> Saving...</>
                            ) : (
                                isEditing ? 'Save Changes' : '✨ Create Story'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StoryEditor;
