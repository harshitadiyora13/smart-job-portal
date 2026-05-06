import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Briefcase } from 'lucide-react';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar navbar-expand-lg navbar-light sticky-top transition-all ${scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
            <div className="container">
                <Link to="/" className="navbar-brand fw-bold text-primary d-flex align-items-center">
                    <Briefcase size={28} className="me-2" />
                    <span>SmartHire</span>
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle navigation"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/jobs">Browse Jobs</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/about">About</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/contact">Contact</Link>
                        </li>
                        <li className="nav-item ms-lg-3">
                            <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>
                            <Link className="btn btn-primary text-white border-0" to="/register" style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }} onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'} onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}>Register</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
