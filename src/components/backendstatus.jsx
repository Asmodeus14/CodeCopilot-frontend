import React, { useState, useEffect } from 'react';

const BackendStatus = () => {
    const [status, setStatus] = useState('checking');
    const [, setUrl] = useState('');
    const [llmStatus, setLlmStatus] = useState('unknown');

    useEffect(() => {
        const checkBackend = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                setUrl(backendUrl);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const healthResponse = await fetch(`${backendUrl}/api/health`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                const healthData = await healthResponse.json();
                
                if (healthResponse.ok) {
                    setStatus('connected');
                    setLlmStatus(healthData.llm_available ? 'enabled' : 'disabled');
                } else {
                    setStatus('error');
                }
            } catch {
                setStatus('error');
                setLlmStatus('unknown');
            }
        };

        checkBackend();
    }, []);

    // Elegant status indicators with icons
    const StatusIndicator = () => {
        switch (status) {
            case 'connected':
                return (
                    <div className="flex items-center space-x-2 text-emerald-400">
                        <div className="relative">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="font-medium">Service Ready</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex items-center space-x-2 text-rose-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Service Unavailable</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center space-x-2 text-amber-400">
                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Checking Status</span>
                    </div>
                );
        }
    };

    const AIIndicator = () => {
        if (llmStatus === 'unknown') return null;

        return (
            <div className={`flex items-center space-x-1.5 text-xs ${
                llmStatus === 'enabled' ? 'text-emerald-300' : 'text-amber-300'
            }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                    llmStatus === 'enabled' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></div>
                <span>AI {llmStatus === 'enabled' ? 'Active' : 'Unavailable'}</span>
            </div>
        );
    };

    // Don't show anything if connected (clean look)
    if (status === 'connected') {
        return (
            <div className="fixed bottom-6 right-6 bg-dark-800/90 backdrop-blur-sm border border-dark-600/50 rounded-xl p-4 text-sm shadow-2xl shadow-black/30">
                <div className="flex items-center space-x-4">
                    <StatusIndicator />
                    <div className="h-4 w-px bg-dark-600"></div>
                    <AIIndicator />
                </div>
                
            </div>
        );
    }

    // Show status when checking or in error state
    return (
        <div className="fixed bottom-6 right-6 bg-dark-800/90 backdrop-blur-sm border border-dark-600/50 rounded-xl p-4 text-sm shadow-2xl shadow-black/30">
            <div className="flex items-center space-x-4">
                <StatusIndicator />
                {llmStatus !== 'unknown' && (
                    <>
                        <div className="h-4 w-px bg-dark-600"></div>
                        <AIIndicator />
                    </>
                )}
            </div>
            {status === 'error' && (
                <div className="mt-2 text-dark-300 text-xs">
                    Unable to reach backend service
                </div>
            )}
        </div>
    );
};

export default BackendStatus;