import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { chapterAPI } from '../services/api';
import './Editor.css';

const QUILL_MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote'],
        [{ 'align': [] }],
        ['link'],
        ['clean'],
    ],
};

const QUILL_FORMATS = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'blockquote', 'align', 'link',
];

const ChapterEditor = () => {
    const { storyId, chapterId } = useParams();
    const navigate = useNavigate();
    const isEditing = !!chapterId;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('draft');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        if (isEditing) {
            fetchChapter();
        }
    }, [chapterId]);

    useEffect(() => {
        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        setWordCount(plainText ? plainText.split(' ').length : 0);
    }, [content]);

    const fetchChapter = async () => {
        setLoading(true);
        try {
            const res = await chapterAPI.getById(storyId, chapterId);
            const ch = res.data.chapter;
            setTitle(ch.title);
            setContent(ch.content || '');
            setStatus(ch.status);
        } catch (err) {
            setError('Failed to load chapter.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (publishStatus) => {
        if (!title.trim()) {
            setError('Chapter title is required.');
            return;
        }

        setSaving(true);
        setError('');
        const saveStatus = publishStatus || status;

        try {
            if (isEditing) {
                await chapterAPI.update(storyId, chapterId, {
                    title,
                    content,
                    status: saveStatus,
                });
            } else {
                await chapterAPI.create(storyId, {
                    title,
                    content,
                    status: saveStatus,
                });
            }
            navigate(`/story/${storyId}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save chapter.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-screen"><div className="loading-spinner"></div></div>;
    }

    return (
        <div className="editor-page chapter-editor-page">
            <div className="chapter-editor-container">
                {/* Top bar */}
                <div className="chapter-editor-topbar">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/story/${storyId}`)}>
                        ← Back to Story
                    </button>
                    <div className="chapter-editor-status">
                        <span className={`badge badge-${status}`}>{status}</span>
                        <span className="word-count">{wordCount.toLocaleString()} words</span>
                    </div>
                </div>

                {error && (
                    <div className="auth-error" style={{ margin: '0 0 1rem 0' }}>
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {/* Title input */}
                <input
                    type="text"
                    className="chapter-title-input"
                    placeholder="Chapter Title..."
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(''); }}
                    id="chapter-title"
                />

                {/* Rich Text Editor */}
                <div className="quill-wrapper" id="chapter-content-editor">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={QUILL_MODULES}
                        formats={QUILL_FORMATS}
                        placeholder="Start writing your chapter..."
                    />
                </div>

                {/* Actions */}
                <div className="chapter-editor-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        id="save-draft-btn"
                    >
                        {saving ? 'Saving...' : '📝 Save as Draft'}
                    </button>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        id="publish-btn"
                    >
                        {saving ? (
                            <><span className="loading-spinner-sm"></span> Publishing...</>
                        ) : (
                            '🚀 Publish Chapter'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChapterEditor;
