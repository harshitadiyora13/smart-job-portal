import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

const ResumeUploadModal = ({ isOpen, onClose, onUpload, uploading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (file) => {
        // Check if it's a PDF or DOC file
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.type)) {
            setSelectedFile(file);
        } else {
            alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header py-3">
                        <h5 className="modal-title">Upload Resume</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="alert alert-info d-flex align-items-center" role="alert">
                            <AlertCircle size={16} className="me-2" />
                            <div>
                                You need to upload your resume before applying for jobs. This helps recruiters review your qualifications.
                            </div>
                        </div>

                        <div 
                            className={`border-2 border-dashed rounded-3 p-4 text-center transition-colors ${
                                dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-300'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            {selectedFile ? (
                                <div className="d-flex flex-column align-items-center">
                                    <FileText size={48} className="text-primary mb-3" />
                                    <p className="mb-2 fw-semibold">{selectedFile.name}</p>
                                    <p className="text-muted small mb-3">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button 
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => setSelectedFile(null)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column align-items-center">
                                    <Upload size={48} className="text-gray-400 mb-3" />
                                    <p className="mb-2 fw-semibold">Drop your resume here</p>
                                    <p className="text-muted small mb-3">or click to browse</p>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="d-none"
                                        id="resume-upload"
                                    />
                                    <label 
                                        htmlFor="resume-upload" 
                                        className="btn btn-outline-primary cursor-pointer"
                                    >
                                        Browse Files
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="mt-3">
                            <small className="text-muted">
                                <strong>Accepted formats:</strong> PDF, DOC, DOCX<br/>
                                <strong>Maximum size:</strong> 5MB
                            </small>
                        </div>
                    </div>
                    <div className="modal-footer py-3">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Uploading...
                                </>
                            ) : (
                                'Upload Resume'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeUploadModal;
