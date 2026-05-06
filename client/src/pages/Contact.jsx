import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-vh-100">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-primary text-white py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
                            <p className="lead mb-4">We'd love to hear from you. Get in touch with our team.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-5">
                        {/* Contact Info */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <h3 className="fw-bold mb-4">Get in Touch</h3>
                                    <div className="mb-4">
                                        <div className="d-flex align-items-start mb-3">
                                            <Mail size={20} className="text-primary me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Email</h6>
                                                <p className="text-muted mb-0">support@smarthire.com</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start mb-3">
                                            <Phone size={20} className="text-primary me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Phone</h6>
                                                <p className="text-muted mb-0">+1 (555) 123-4567</p>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-start">
                                            <MapPin size={20} className="text-primary me-3 mt-1" />
                                            <div>
                                                <h6 className="fw-bold mb-1">Address</h6>
                                                <p className="text-muted mb-0">
                                                    123 Business Street<br />
                                                    San Francisco, CA 94102
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h3 className="fw-bold mb-4">Office Hours</h3>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Monday - Friday</span>
                                        <span className="fw-bold">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Saturday - Sunday</span>
                                        <span className="fw-bold">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-5">
                                    <h3 className="fw-bold mb-4">Send us a Message</h3>
                                    {submitted ? (
                                        <div className="alert alert-success">
                                            <MessageSquare className="me-2" />
                                            Thank you for your message! We'll get back to you soon.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit}>
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold">Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="Your name"
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold">Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="your@email.com"
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-bold">Subject</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="subject"
                                                        value={formData.subject}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="How can we help?"
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label fw-bold">Message</label>
                                                    <textarea
                                                        className="form-control"
                                                        name="message"
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        required
                                                        rows="6"
                                                        placeholder="Tell us more about your inquiry..."
                                                    ></textarea>
                                                </div>
                                                <div className="col-12">
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary text-white border-0 w-100 py-3 fw-semibold"
                                                        style={{ background: "linear-gradient(to right, #2F80ED, #1C5ED6)", transition: "all 0.3s ease" }}
                                                        onMouseEnter={e => e.target.style.background = 'linear-gradient(to right, #1C5ED6, #174DB0)'}
                                                        onMouseLeave={e => e.target.style.background = 'linear-gradient(to right, #2F80ED, #1C5ED6)'}
                                                    >
                                                        <Send className="me-2" size={18} />
                                                        Send Message
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-center fw-bold mb-5">Frequently Asked Questions</h2>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">How do I create an account?</h5>
                                    <p className="text-muted mb-0">
                                        Click on the "Register" button in the navbar and fill in your details.
                                        You can sign up as a job seeker or a recruiter.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">Is SmartHire free to use?</h5>
                                    <p className="text-muted mb-0">
                                        Yes! Our platform is completely free for job seekers. Recruiters can post jobs
                                        and access premium features with affordable plans.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">How do I apply for a job?</h5>
                                    <p className="text-muted mb-0">
                                        Browse jobs, click on any listing to view details, and click "Apply Now".
                                        Make sure your profile is complete with your resume.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">Can I edit my application?</h5>
                                    <p className="text-muted mb-0">
                                        Once submitted, applications cannot be edited. However, you can update your
                                        profile and resume at any time for future applications.
                                    </p>
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

export default Contact;
