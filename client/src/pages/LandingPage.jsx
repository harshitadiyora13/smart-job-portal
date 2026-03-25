import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Users, TrendingUp, Shield, ArrowRight, Star, MapPin, Clock, DollarSign, CheckCircle, Zap, Target, Globe, Award, Menu, X, ChevronRight, UserCheck, FileText, BarChart3, MessageSquare, Heart, Linkedin, Twitter, Github, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeJobs, setActiveJobs] = useState(0);
    const [companies, setCompanies] = useState(0);
    const [jobSeekers, setJobSeekers] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const statsRef = useRef(null);

    const targetStats = { activeJobs: 10000, companies: 5000, jobSeekers: 50000 };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    animateCounters();
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const animateCounters = () => {
        const duration = 2000;
        const steps = 60;
        const increment = {
            activeJobs: targetStats.activeJobs / steps,
            companies: targetStats.companies / steps,
            jobSeekers: targetStats.jobSeekers / steps
        };

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            setActiveJobs(Math.min(Math.floor(increment.activeJobs * currentStep), targetStats.activeJobs));
            setCompanies(Math.min(Math.floor(increment.companies * currentStep), targetStats.companies));
            setJobSeekers(Math.min(Math.floor(increment.jobSeekers * currentStep), targetStats.jobSeekers));

            if (currentStep >= steps) clearInterval(timer);
        }, duration / steps);
    };

    const features = [
        {
            icon: <Target size={48} />,
            title: "Smart Matching",
            description: "AI-powered algorithm matches your skills and experience with perfect job opportunities."
        },
        {
            icon: <Zap size={48} />,
            title: "Real-time Updates",
            description: "Get instant notifications when employers view your application or when new jobs match your profile."
        },
        {
            icon: <Shield size={48} />,
            title: "Secure & Private",
            description: "Your data is protected with enterprise-grade security. Control who sees your information."
        },
        {
            icon: <FileText size={48} />,
            title: "Easy Application",
            description: "Apply to multiple jobs with just a few clicks. Track all your applications in one place."
        },
        {
            icon: <Globe size={48} />,
            title: "Location-based Search",
            description: "Find jobs near you or explore opportunities in different cities and countries."
        },
        {
            icon: <BarChart3 size={48} />,
            title: "Salary Insights",
            description: "Get salary information and negotiate better pay with market insights."
        }
    ];

    const steps = [
        {
            icon: <UserCheck size={32} />,
            title: "Create Profile",
            description: "Sign up and create your detailed profile with skills, experience, and preferences."
        },
        {
            icon: <Search size={32} />,
            title: "Search & Apply",
            description: "Browse through thousands of job listings and apply with a single click."
        },
        {
            icon: <Award size={32} />,
            title: "Get Hired",
            description: "Track your applications, attend interviews, and land your dream job."
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Software Developer",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
            rating: 5,
            content: "Found my dream job within 2 weeks! The platform is intuitive and notifications kept me updated throughout the process."
        },
        {
            name: "Michael Chen",
            role: "HR Manager",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            rating: 5,
            content: "As a recruiter, this platform has made hiring so much easier. Quality candidates and excellent communication tools."
        },
        {
            name: "Emily Davis",
            role: "Marketing Manager",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            rating: 4,
            content: "The application tracking feature is amazing. I could see exactly where I was in the hiring process."
        }
    ];

    return (
        <div className="min-vh-100">
            {/* Navigation */}
            <nav className={`navbar navbar-expand-lg navbar-light sticky-top transition-all ${scrolled ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
                <div className="container">
                    <Link to="/" className="navbar-brand fw-bold text-primary d-flex align-items-center">
                        <Briefcase size={24} className="me-2" />
                        SmartHire
                    </Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#features">Features</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#how-it-works">How It Works</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#testimonials">Testimonials</a>
                            </li>
                            <li className="nav-item">
                                <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="btn d-flex align-items-center bg-primary gap-2 shadow-sm text-white px-3">Sign Up</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-primary text-white py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-4">
                                Find Your Dream Job
                                <br />
                                or Hire Top Talent
                            </h1>
                            <p className="lead mb-4">
                                Connect with thousands of job seekers and employers. Smart matching, real-time notifications, and seamless application tracking.
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <Link to="/register" className="btn btn-light btn-lg">
                                    Get Started <ArrowRight size={20} className="ms-2" />
                                </Link>
                                <Link to="/login" className="btn btn-outline-light btn-lg">
                                    Sign In
                                </Link>
                            </div>
                            <div ref={statsRef} className="mt-4">
                                <div className="d-flex gap-4">

                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="text-center">
                                <img
                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
                                    alt="Job Portal"
                                    className="img-fluid rounded-3 shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold">Why Choose <span className="text-primary">SmartHire?</span></h2>
                        <p className="lead text-muted">Powerful features designed for both job seekers and employers</p>
                    </div>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm hover-lift">
                                    <div className="card-body text-center p-4">
                                        <div className="text-primary mb-3">
                                            {feature.icon}
                                        </div>
                                        <h4 className="card-title">{feature.title}</h4>
                                        <p className="card-text text-muted">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-5 bg-light">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold">How It Works</h2>
                        <p className="lead text-muted">Get started in 3 simple steps</p>
                    </div>
                    <div className="row g-4">
                        {steps.map((step, index) => (
                            <div key={index} className="col-md-4 text-center">
                                <div className="position-relative d-inline-block">
                                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                        {step.icon}
                                    </div>
                                    <span className="position-absolute top-0 start-50 translate-middle badge bg-secondary rounded-pill">{index + 1}</span>
                                </div>
                                <h4>{step.title}</h4>
                                <p className="text-muted">
                                    {step.description}
                                </p>
                                {index < steps.length - 1 && (
                                    <div className="d-none d-md-block position-absolute top-10 start-100 w-100 h-1 bg-primary bg-opacity-20"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-bold">What People Say</h2>
                        <p className="lead text-muted">Success stories from our users</p>
                    </div>
                    <div className="row g-4">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="col-lg-4">
                                <div className="card h-100 border-0 shadow-sm hover-lift">
                                    <div className="card-body p-4">
                                        <div className="d-flex mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < testimonial.rating ? 'text-warning fill-current' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <p className="card-text">
                                            "{testimonial.content}"
                                        </p>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                className="rounded-circle me-3"
                                                style={{ width: '48px', height: '48px' }}
                                            />
                                            <div>
                                                <h6 className="mb-0">{testimonial.name}</h6>
                                                <small className="text-muted">{testimonial.role}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-primary text-white py-5">
                <div className="container text-center">
                    <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Career?</h2>
                    <p className="lead mb-4">
                        Join thousands of professionals who have found their perfect match and companies that have built amazing teams.
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Link to="/register" className="btn btn-light btn-lg">
                            Get Started Now <ArrowRight size={20} className="ms-2" />
                        </Link>
                        <Link to="/login" className="btn btn-outline-light btn-lg">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-4">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-3">
                                <Briefcase size={24} className="me-2" />
                                <h5 className="mb-0">SmartHire</h5>
                            </div>
                            <p className="text-muted">Connecting talent with opportunity worldwide.</p>
                        </div>
                        <div className="col-md-6">
                            <div className="row">
                                <div className="col-6">
                                    <h6 className="mb-3">Quick Links</h6>
                                    <ul className="list-unstyled">
                                        <li><a href="#features" className="text-muted text-decoration-none">Features</a></li>
                                        <li><a href="#how-it-works" className="text-muted text-decoration-none">How It Works</a></li>
                                        <li><Link to="/login" className="text-muted text-decoration-none">Login</Link></li>
                                        <li><Link to="/register" className="text-muted text-decoration-none">Sign Up</Link></li>
                                    </ul>
                                </div>
                                <div className="col-6">
                                    <h6 className="mb-3">Connect</h6>
                                    <div className="d-flex gap-3">
                                        <a href="#" className="text-muted"><Linkedin size={20} /></a>
                                        <a href="#" className="text-muted"><Twitter size={20} /></a>
                                        <a href="#" className="text-muted"><Github size={20} /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4 border-secondary" />
                    <div className="text-center">
                        <p className="text-muted mb-0">© 2024 SmartHire. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
