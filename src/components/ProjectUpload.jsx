import React, { useState } from 'react';

const ProjectUpload = ({ onAnalysisComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');

    // 🚀 MASSIVELY INCREASED FILE SIZE: 400MB
    const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB

    // Get backend URL from environment with fallbacks
    const getBackendUrl = () => {
        return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = async (file) => {
        if (!file.name.endsWith('.zip')) {
            setError('Please upload a ZIP file containing your project');
            setErrorDetails('Your project must be compressed as a .zip file. Most operating systems have built-in zip functionality.');
            return;
        }

        // 🚀 UPDATED FILE SIZE CHECK: 400MB
        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
            setError(`File size must be less than ${maxSizeMB}MB`);
            setErrorDetails(`Your file is ${fileSizeMB}MB, but the maximum allowed is ${maxSizeMB}MB. Try removing large files like videos, images, or node_modules folder.`);
            return;
        }

        // Check if file is empty
        if (file.size === 0) {
            setError('File is empty');
            setErrorDetails('The ZIP file appears to be empty. Please check your project and try again.');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setErrorDetails('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const backendUrl = getBackendUrl();
            console.log('Uploading to:', `${backendUrl}/api/analyze`);
            
            const response = await fetch(`${backendUrl}/api/analyze`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle structured backend errors
                if (data.error && data.user_tip) {
                    throw new Error(`${data.error}\n\n${data.user_tip}`);
                } else if (data.error) {
                    throw new Error(data.error);
                } else {
                    throw new Error(`Analysis failed: ${response.status}`);
                }
            }

            onAnalysisComplete(data);
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err.message || 'Failed to analyze project. Please try again.';
            
            // Split error message into main error and details if it contains newlines
            if (errorMessage.includes('\n\n')) {
                const [mainError, details] = errorMessage.split('\n\n');
                setError(mainError);
                setErrorDetails(details);
            } else {
                setError(errorMessage);
                setErrorDetails('');
            }

            // Special handling for connection errors
            if (err.message.includes('Failed to fetch')) {
                setError('Cannot connect to the analysis server');
                setErrorDetails('Please make sure the backend is running on port 5000. Check that the server is started and accessible.');
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Upload Zone */}
            <div
                className={`card p-12 text-center cursor-pointer transition-all duration-500 border-2 border-dashed ${
                    isDragging 
                        ? 'border-primary-500 bg-primary-500/10 ring-4 ring-primary-500/20 scale-105' 
                        : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-700/50'
                } ${isAnalyzing ? 'pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isAnalyzing ? (
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full absolute top-0 left-0 animate-spin-slow"></div>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-white mb-2">Analyzing your project</p>
                            <p className="text-gray-400">Scanning for issues and optimization opportunities...</p>
                            <p className="text-gray-500 text-sm mt-2">Large projects may take a bit longer to analyze</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-6xl mb-6 opacity-80">📁</div>
                        <h3 className="text-2xl font-bold text-white mb-3">Upload Your Project</h3>
                        <p className="text-gray-400 mb-8">Drag & drop your project ZIP file here</p>
                        <input
                            type="file"
                            id="file-input"
                            accept=".zip"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <button 
                            className="btn-primary"
                            onClick={() => document.getElementById('file-input').click()}
                            type="button"
                        >
                            Choose File
                        </button>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="text-left">
                            <p className="text-red-300 font-semibold text-lg mb-2">{error}</p>
                            {errorDetails && (
                                <p className="text-red-200/80 text-sm">{errorDetails}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="mt-8 card p-8 glass">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Perfect for Large Projects
                </h4>
                <ul className="space-y-3 text-gray-400">
                    <li className="flex items-start">
                        <span className="text-primary-400 mr-3 mt-1">•</span>
                        <span>Zip your entire project folder (including package.json, assets, node_modules)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary-400 mr-3 mt-1">•</span>
                        <span>Include all configuration files (tsconfig.json, .env, webpack.config.js, etc.)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary-400 mr-3 mt-1">•</span>
                        <span>
                            {/* 🚀 UPDATED SIZE IN TIPS: 400MB */}
                            <strong className="text-white">Massive file support:</strong> Up to {formatFileSize(MAX_FILE_SIZE)} per project
                        </span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary-400 mr-3 mt-1">•</span>
                        <span>Handles up to 50,000 files and 800MB extracted content</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary-400 mr-3 mt-1">•</span>
                        <span className="text-green-400">
                            <strong>Perfect for:</strong> Full-stack apps, monorepos, enterprise projects with dependencies
                        </span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-primary-400 mr-3 mt-1">•</span>
                        <span className="text-blue-400">
                            <strong>Security:</strong> Advanced zip bomb protection keeps your data safe
                        </span>
                    </li>
                </ul>
            </div>

            {/* Security Features */}
            <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h5 className="text-blue-300 font-semibold mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Security & Privacy
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200/80">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Files are processed securely and deleted immediately</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Zip bomb protection prevents malicious uploads</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>No data stored or shared with third parties</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Local processing option available</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectUpload;