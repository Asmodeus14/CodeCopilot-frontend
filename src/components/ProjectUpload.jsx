import React, { useState } from 'react';

const ProjectUpload = ({ onAnalysisComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [errorDetails, setErrorDetails] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    // 🚀 INCREASED FILE SIZE: 500MB to handle extracted content
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

    // Get backend URL from environment with fallbacks
    const getBackendUrl = () => {
        return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    };

    const handleFile = async (file) => {
        if (!file.name.endsWith('.zip')) {
            setError('Please upload a ZIP file containing your project');
            setErrorDetails('Your project must be compressed as a .zip file. Most operating systems have built-in zip functionality.');
            return;
        }

        // 🚀 UPDATED FILE SIZE CHECK: 500MB
        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
            setError(`File size must be less than ${maxSizeMB}MB`);
            setErrorDetails(`Your file is ${fileSizeMB}MB, but the maximum allowed is ${maxSizeMB}MB. The system automatically removes node_modules and other large files.`);
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
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const backendUrl = getBackendUrl();
            console.log('Uploading:', {
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                backendUrl: `${backendUrl}/api/analyze`
            });
            
            const response = await fetch(`${backendUrl}/api/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                
                // 🎯 ADDED: Show cleaning statistics if available
                if (data.project_stats?.auto_cleaning_stats) {
                    const stats = data.project_stats.auto_cleaning_stats;
                    console.log('Cleaning stats:', stats);
                }
                
                onAnalysisComplete(data);
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { error: `Analysis failed: ${response.status}` };
                }
                
                // 🎯 IMPROVED ERROR HANDLING: Better parsing of backend errors
                if (errorData.error) {
                    if (errorData.details) {
                        throw new Error(`${errorData.error}\n\n${errorData.details}`);
                    } else if (errorData.user_tip) {
                        throw new Error(`${errorData.error}\n\n${errorData.user_tip}`);
                    } else {
                        throw new Error(errorData.error);
                    }
                } else {
                    throw new Error(`Analysis failed: ${response.status}`);
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            
            // 🎯 IMPROVED ERROR PARSING
            let errorMessage = err.message || 'Failed to analyze project. Please try again.';
            let errorDetail = '';
            
            // Handle different error formats
            if (errorMessage.includes('\n\n')) {
                const parts = errorMessage.split('\n\n');
                errorMessage = parts[0];
                errorDetail = parts.slice(1).join('\n\n');
            } else if (errorMessage.includes('Project too large after automatic cleaning')) {
                // Special handling for size errors
                errorMessage = 'Project too large after processing';
                errorDetail = 'The system automatically removed node_modules and other files, but the remaining content is still large. Try removing more files manually before zipping.';
            }
            
            setError(errorMessage);
            setErrorDetails(errorDetail);

            // Special handling for connection errors
            if (err.message.includes('Cannot connect') || err.message.includes('Failed to fetch')) {
                setError('Cannot connect to the analysis server');
                setErrorDetails('Please make sure the backend is running on port 5000. Check that the server is started and accessible.');
            }
        } finally {
            setIsAnalyzing(false);
            setUploadProgress(0);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Ensure drag leave resets visual state
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Handle drop event: grab first file and process it
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer?.files && e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    // Handle file input selection
    const handleFileInput = (e) => {
        const file = e.target?.files && e.target.files[0];
        if (file) {
            handleFile(file);
        }
        // clear the input so the same file can be selected again if needed
        e.target.value = null;
    };

    // Quick start examples - UPDATED with better guidance
    const quickStartExamples = [
        {
            title: "Remove node_modules",
            command: "Delete node_modules folder before zipping",
            icon: "🗑️",
            description: "Saves 300-800MB instantly"
        },
        {
            title: "Remove build artifacts", 
            command: "Delete dist/, build/, .next folders",
            icon: "📦",
            description: "Saves 50-200MB"
        },
        {
            title: "Create optimized ZIP",
            command: "zip -r project.zip . -x 'node_modules/*' '.git/*'",
            icon: "💻",
            description: "Exclude large directories"
        }
    ];

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
                            <div className="w-20 h-20 border-4 border-primary-500/20 rounded-full"></div>
                            <div className="w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full absolute top-0 left-0 animate-spin-slow"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-primary-400 font-bold text-lg">
                                    {uploadProgress > 0 ? `${uploadProgress}%` : '⋯'}
                                </span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-semibold text-white mb-2">
                                Analyzing Your Project
                            </p>
                            <p className="text-gray-400 mb-3">
                                Automatically cleaning files and scanning for issues...
                            </p>
                            
                            {/* Simulated Progress Bar */}
                            <div className="w-full bg-dark-600 rounded-full h-2 mt-4">
                                <div 
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300 ease-out animate-pulse"
                                    style={{ width: '100%' }}
                                ></div>
                            </div>
                            
                            <p className="text-gray-500 text-sm mt-3">
                                The system is automatically removing node_modules and other large files...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-6xl mb-6 opacity-80">📁</div>
                        <h3 className="text-2xl font-bold text-white mb-3">Upload Your Project</h3>
                        <p className="text-gray-400 mb-6">Drag & drop your project ZIP file here</p>
                        
                        {/* File Requirements - UPDATED */}
                        <div className="bg-dark-700/50 rounded-lg p-4 mb-6 border border-dark-600">
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>.zip files only</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Up to {formatFileSize(MAX_FILE_SIZE)}</span>
                                </div>
                            </div>
                            <p className="text-green-300 text-xs mt-2 text-center">
                                💡 We automatically remove node_modules and large files
                            </p>
                        </div>
                        
                        <input
                            type="file"
                            id="file-input"
                            accept=".zip"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                        <button 
                            className="btn-primary text-lg px-8 py-4"
                            onClick={() => document.getElementById('file-input').click()}
                            type="button"
                        >
                            Choose ZIP File
                        </button>
                    </>
                )}
            </div>

            {/* Error Message - IMPROVED */}
            {error && (
                <div className="mt-6 p-6 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-fade-in">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                            <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-red-300 font-semibold text-lg mb-2">{error}</p>
                            {errorDetails && (
                                <p className="text-red-200/80 text-sm leading-relaxed">{errorDetails}</p>
                            )}
                            
                            {/* 🎯 ADDED: Quick fix buttons for common errors */}
                            {(error.includes('too large') || error.includes('compression')) && (
                                <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                                    <p className="text-red-200 text-sm font-semibold mb-2">Quick Fixes:</p>
                                    <ul className="text-red-200/80 text-sm space-y-1">
                                        <li>• Remove <code className="bg-red-500/30 px-1 rounded">node_modules</code> folder before zipping</li>
                                        <li>• Remove <code className="bg-red-500/30 px-1 rounded">dist/</code>, <code className="bg-red-500/30 px-1 rounded">build/</code> folders</li>
                                        <li>• Use: <code className="bg-red-500/30 px-1 rounded">zip -r project.zip . -x "node_modules/*" ".git/*"</code></li>
                                    </ul>
                                </div>
                            )}
                            
                            <button 
                                className="mt-3 text-red-300 hover:text-red-200 text-sm underline transition-colors"
                                onClick={() => { setError(''); setErrorDetails(''); }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Start Guide - UPDATED */}
            <div className="mt-8 card p-8 glass">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Optimization Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {quickStartExamples.map((example, index) => (
                        <div key={index} className="bg-dark-700/50 rounded-lg p-4 border border-dark-600 hover:border-primary-500/30 transition-colors">
                            <div className="text-2xl mb-2">{example.icon}</div>
                            <h5 className="text-white font-semibold text-sm mb-2">{example.title}</h5>
                            <p className="text-gray-400 text-xs font-mono bg-dark-800 p-2 rounded border border-dark-700 mb-2">
                                {example.command}
                            </p>
                            <p className="text-green-400 text-xs">{example.description}</p>
                        </div>
                    ))}
                </div>
                
                <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
                    <h5 className="text-primary-300 font-semibold mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Automatic Cleaning
                    </h5>
                    <p className="text-primary-200 text-sm">
                        <strong>We handle the heavy lifting:</strong> The system automatically removes node_modules, .git, and other large files during analysis. Just upload your project as-is!
                    </p>
                </div>
            </div>

            {/* Features & Capabilities - UPDATED */}
            <div className="mt-6 card p-8">
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    How It Works
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-blue-400 font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">Upload Any Project</h5>
                                <p className="text-gray-400 text-xs">Upload your ZIP file as-is, even with node_modules</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-green-400 font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">Automatic Cleaning</h5>
                                <p className="text-gray-400 text-xs">We remove node_modules, .git, and large files automatically</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-purple-400 font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">Smart Analysis</h5>
                                <p className="text-gray-400 text-xs">We analyze package.json and source code for issues</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-orange-400 font-bold text-sm">4</span>
                            </div>
                            <div>
                                <h5 className="text-white font-semibold text-sm">Get Results</h5>
                                <p className="text-gray-400 text-xs">Receive detailed analysis with AI-powered solutions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectUpload;