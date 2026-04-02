import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer" id="main-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <span className="footer-logo">📖 StoryVerse</span>
                    <p className="footer-tagline">Where stories come alive</p>
                </div>
                <div className="footer-links">
                    <Link to="/">Explore Stories</Link>
                    <Link to="/register">Start Writing</Link>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} StoryVerse. Built with ❤️</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
