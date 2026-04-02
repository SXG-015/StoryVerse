import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({ display_name: '', bio: '', avatar_url: '' });
    const { updateProfile } = useAuth();

    const isOwnProfile = currentUser && currentUser.id === id;

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await userAPI.getProfile(id);
            setProfile(res.data.user);
            setStories(res.data.stories);
            setEditData({
                display_name: res.data.user.display_name || '',
                bio: res.data.user.bio || '',
                avatar_url: res.data.user.avatar_url || '',
            });
        } catch (err) {
            setError('User not found.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updateProfile(editData);
            setProfile(prev => ({ ...prev, ...editData }));
            setEditing(false);
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
    if (error) return <div className="loading-screen"><p>{error}</p></div>;
    if (!profile) return null;

    return (
        <div className="profile-page">
            <div className="container">
                {/* Profile header */}
                <div className="profile-header">
                    <div className="profile-avatar-large">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.display_name} />
                        ) : (
                            <span className="avatar-fallback-large">
                                {(profile.display_name || profile.username || 'U')[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="profile-info">
                        {editing ? (
                            <div className="profile-edit-form">
                                <div className="form-group">
                                    <label className="form-label">Display Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={editData.display_name}
                                        onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Bio</label>
                                    <textarea
                                        className="form-textarea"
                                        rows={3}
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        placeholder="Tell readers about yourself..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Avatar URL</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        value={editData.avatar_url}
                                        onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="profile-edit-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="profile-name">{profile.display_name || profile.username}</h1>
                                <p className="profile-username">@{profile.username}</p>
                                <span className={`badge badge-${profile.role === 'writer' ? 'ongoing' : 'draft'}`}>
                                    {profile.role === 'writer' ? '✍️ Writer' : '📚 Reader'}
                                </span>
                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                                <p className="profile-joined">
                                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                                {isOwnProfile && (
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
                                        Edit Profile
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Published stories */}
                {stories.length > 0 && (
                    <div className="profile-stories-section">
                        <h2 className="section-title">Published Stories ({stories.length})</h2>
                        <div className="profile-stories-grid">
                            {stories.map(story => (
                                <Link to={`/story/${story.id}`} key={story.id} className="story-card">
                                    <div className="story-card-cover">
                                        {story.cover_image_url ? (
                                            <img src={story.cover_image_url} alt={story.title} />
                                        ) : (
                                            <div className="story-card-cover-placeholder"><span>📖</span></div>
                                        )}
                                    </div>
                                    <div className="story-card-body">
                                        <h3 className="story-card-name">{story.title}</h3>
                                        <div className="story-card-footer">
                                            <span className="story-card-genre">{story.genre}</span>
                                            <span className="story-card-chapters">{story.chapter_count || 0} ch.</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {stories.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>No published stories</h3>
                        <p>{isOwnProfile ? 'Start writing your first story!' : 'This user hasn\'t published any stories yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
