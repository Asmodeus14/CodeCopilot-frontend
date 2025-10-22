// src/components/Logo.jsx
import React from 'react';

const Logo = ({ className = "h-8" }) => {
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                CodeCopilot
            </span>
        </div>
    );
};

export default Logo;