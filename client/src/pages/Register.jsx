import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'reader',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });
            navigate('/dashboard');
        } catch (err) {
            const serverError = err.response?.data;
            if (serverError?.details) {
                setError(serverError.details.map(d => d.message).join('. '));
            } else {
                setError(serverError?.error || 'Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-art">
                    <div className="auth-art-content">
                        <div className="auth-art-icon">🚀</div>
                        <h2>Join StoryVerse</h2>
                        <p>Discover thousands of stories or share your own with a worldwide community of readers and writers.</p>
                        <div className="auth-art-shapes">
                            <div className="shape shape-1"></div>
                            <div className="shape shape-2"></div>
                            <div className="shape shape-3"></div>
                        </div>
                    </div>
                </div>

                <div className="auth-form-section">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h1>Create Account</h1>
                            <p>Start your journey in the world of stories</p>
                        </div>

                        {error && (
                            <div className="auth-error" id="register-error">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    placeholder="Choose a unique username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    pattern="[a-zA-Z0-9_]+"
                                    title="Only letters, numbers, and underscores"
                                    autoComplete="username"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-email">Email Address</label>
                                <input
                                    type="email"
                                    id="reg-email"
                                    name="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="reg-password">Password</label>
                                    <input
                                        type="password"
                                        id="reg-password"
                                        name="password"
                                        className="form-input"
                                        placeholder="Min. 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        className="form-input"
                                        placeholder="Re-enter password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">I want to</label>
                                <div className="role-selector" id="role-selector">
                                    <label className={`role-option ${formData.role === 'reader' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="reader"
                                            checked={formData.role === 'reader'}
                                            onChange={handleChange}
                                        />
                                        <span className="role-icon">📚</span>
                                        <span className="role-label">Read Stories</span>
                                        <span className="role-desc">Discover & follow stories</span>
                                    </label>
                                    <label className={`role-option ${formData.role === 'writer' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="writer"
                                            checked={formData.role === 'writer'}
                                            onChange={handleChange}
                                        />
                                        <span className="role-icon">✍️</span>
                                        <span className="role-label">Write Stories</span>
                                        <span className="role-desc">Create & publish stories</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg auth-submit" id="register-submit" disabled={loading}>
                                {loading ? (
                                    <><span className="loading-spinner-sm"></span> Creating account...</>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <p className="auth-switch">
                            Already have an account? <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
