import React from 'react';
import { Target, Users, Award, Heart, Briefcase, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const About = () => {
    return (
        <div className="min-vh-100">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-primary text-white py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h1 className="display-4 fw-bold mb-4">About SmartHire</h1>
                            <p className="lead mb-4">Connecting talent with opportunity since 2024</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <h2 className="fw-bold mb-4">Our Mission</h2>
                            <p className="text-muted mb-4">
                                At SmartHire, we believe that everyone deserves to find meaningful work that aligns with their skills and passions.
                                Our platform bridges the gap between talented job seekers and forward-thinking companies, creating opportunities
                                that transform careers and businesses alike.
                            </p>
                            <p className="text-muted">
                                We leverage cutting-edge technology to make the hiring process seamless, transparent, and efficient for everyone involved.
                            </p>
                        </div>
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-5">
                                    <Target size={48} className="text-primary mb-3" />
                                    <h3 className="fw-bold mb-3">Our Vision</h3>
                                    <p className="text-muted">
                                        To become the world's most trusted platform for career growth and talent acquisition,
                                        where every connection leads to success.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center fw-bold mb-5">Our Core Values</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 text-center">
                                <div className="card-body p-4">
                                    <Users size={40} className="text-primary mb-3" />
                                    <h4 className="fw-bold mb-3">People First</h4>
                                    <p className="text-muted">
                                        We prioritize the needs and experiences of our users in every decision we make.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 text-center">
                                <div className="card-body p-4">
                                    <Award size={40} className="text-primary mb-3" />
                                    <h4 className="fw-bold mb-3">Excellence</h4>
                                    <p className="text-muted">
                                        We strive for the highest quality in everything we do, from our platform to our support.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 text-center">
                                <div className="card-body p-4">
                                    <Heart size={40} className="text-primary mb-3" />
                                    <h4 className="fw-bold mb-3">Integrity</h4>
                                    <p className="text-muted">
                                        We operate with transparency, honesty, and ethical practices in all our interactions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4 mb-4">
                            <Briefcase size={48} className="text-primary mb-3" />
                            <h3 className="display-4 fw-bold">10,000+</h3>
                            <p className="text-muted">Active Jobs</p>
                        </div>
                        <div className="col-md-4 mb-4">
                            <Users size={48} className="text-primary mb-3" />
                            <h3 className="display-4 fw-bold">50,000+</h3>
                            <p className="text-muted">Job Seekers</p>
                        </div>
                        <div className="col-md-4 mb-4">
                            <CheckCircle size={48} className="text-primary mb-3" />
                            <h3 className="display-4 fw-bold">5,000+</h3>
                            <p className="text-muted">Companies</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center fw-bold mb-5">Meet Our Team</h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                                    alt="Team Member"
                                    className="card-img-top"
                                />
                                <div className="card-body text-center">
                                    <h5 className="fw-bold">John Smith</h5>
                                    <p className="text-muted mb-0">CEO & Founder</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face"
                                    alt="Team Member"
                                    className="card-img-top"
                                />
                                <div className="card-body text-center">
                                    <h5 className="fw-bold">Sarah Johnson</h5>
                                    <p className="text-muted mb-0">CTO</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                                    alt="Team Member"
                                    className="card-img-top"
                                />
                                <div className="card-body text-center">
                                    <h5 className="fw-bold">Michael Brown</h5>
                                    <p className="text-muted mb-0">Head of Product</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-dark text-white py-4">
                <div className="container text-center">
                    <p className="mb-0">&copy; 2024 SmartHire. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
