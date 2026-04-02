import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, isWriter, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar" id="main-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">📖</span>
                    <span className="brand-text">StoryVerse</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Explore</Link>

                    <ThemeToggle />

                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            {isWriter && (
                                <Link to="/story/new" className="nav-link nav-link-create">
                                    ✍️ Write
                                </Link>
                            )}
                            <div className="nav-user-menu">
                                <button className="nav-user-btn" id="user-menu-btn">
                                    <span className="nav-avatar">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.display_name} />
                                        ) : (
                                            <span className="avatar-fallback">
                                                {(user?.display_name || user?.username || 'U')[0].toUpperCase()}
                                            </span>
                                        )}
                                    </span>
                                    <span className="nav-username">{user?.display_name || user?.username}</span>
                                </button>
                                <div className="nav-dropdown">
                                    <Link to={`/profile/${user?.id}`} className="dropdown-item">My Profile</Link>
                                    <Link to="/dashboard" className="dropdown-item">My Stories</Link>
                                    <hr className="dropdown-divider" />
                                    <button onClick={handleLogout} className="dropdown-item dropdown-logout" id="logout-btn">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="nav-auth-links">
                            <Link to="/login" className="nav-link" id="login-link">Sign In</Link>
                            <Link to="/register" className="nav-link nav-link-register" id="register-link">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

