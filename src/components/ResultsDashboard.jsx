import React from 'react';
import Logo from './Logo';

const ResultsDashboard = ({ analysisResults, onReset }) => {
    // Add safe destructuring with defaults
    const { 
        health_score = 0, 
        issues = [], 
        summary = {}, 
        project_stats = {}, 
        llm_enhanced = false, 
        timestamp 
    } = analysisResults || {};

    // Compute priority breakdown if not provided
    const computedPriorityBreakdown = summary.priority_breakdown || {
        1: issues.filter(issue => issue.priority === 1 || issue.severity === 'high').length,
        2: issues.filter(issue => issue.priority === 2 || issue.severity === 'medium').length,
        3: issues.filter(issue => issue.priority === 3 || issue.severity === 'low').length
    };

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getPriorityBadge = (issue) => {
        // Support both priority number and severity string
        const priority = issue.priority || (issue.severity === 'high' ? 1 : issue.severity === 'medium' ? 2 : 3);
        
        const config = {
            1: { label: 'Critical', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
            2: { label: 'Major', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
            3: { label: 'Minor', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
        };
        const { label, class: className } = config[priority] || config[2];
        return (
            <span className={`px-3 py-1 text-sm font-medium border rounded-full ${className}`}>
                {label}
            </span>
        );
    };

    const getHealthMessage = (score) => {
        if (score >= 80) return { message: 'Excellent! Your project is in great shape.', emoji: '🎉' };
        if (score >= 60) return { message: 'Good! Some improvements can be made.', emoji: '👍' };
        if (score >= 40) return { message: 'Needs attention. Review the issues below.', emoji: '⚠️' };
        return { message: 'Requires immediate fixes. Critical issues found.', emoji: '🚨' };
    };

    const healthInfo = getHealthMessage(health_score);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log('Command copied to clipboard');
        });
    };

    // Get solution text from either solution or fix field
    const getSolutionText = (issue) => {
        return issue.solution || issue.fix || issue.detailed_solution || 'No solution provided.';
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Logo className="h-8 mb-2" />
                    <h2 className="text-3xl font-bold text-white mt-2">Analysis Results</h2>
                </div>
                <button 
                    className="btn-secondary whitespace-nowrap"
                    onClick={onReset}
                >
                    Analyze New Project
                </button>
            </div>

            {/* LLM Status Badge */}
            {llm_enhanced && (
                <div className="flex items-center justify-center">
                    <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                        🧠 AI-Powered Analysis Enabled
                    </div>
                </div>
            )}

            {/* Health Score Card */}
            <div className="card p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="relative">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                            <circle
                                cx="70"
                                cy="70"
                                r="64"
                                fill="none"
                                stroke="#334155"
                                strokeWidth="8"
                            />
                            <circle
                                cx="70"
                                cy="70"
                                r="64"
                                fill="none"
                                stroke="currentColor"
                                className={getHealthColor(health_score)}
                                strokeWidth="8"
                                strokeDasharray={`${(health_score / 100) * 402.12} 402.12`}
                                transform="rotate(-90 70 70)"
                            />
                            <text
                                x="70"
                                y="70"
                                textAnchor="middle"
                                dy="8"
                                fontSize="28"
                                fontWeight="bold"
                                className={getHealthColor(health_score)}
                            >
                                {health_score}
                            </text>
                        </svg>
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <h3 className="text-2xl font-bold text-white mb-3">Project Health Score</h3>
                        <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                            <span className="text-2xl">{healthInfo.emoji}</span>
                            <p className="text-lg text-gray-300">{healthInfo.message}</p>
                        </div>
                        
                        {/* Project Stats */}
                        {project_stats && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{project_stats.total_files || 0}</div>
                                    <div className="text-gray-400 text-sm">Total Files</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{project_stats.package_files || 0}</div>
                                    <div className="text-gray-400 text-sm">Package Files</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{project_stats.config_files || 0}</div>
                                    <div className="text-gray-400 text-sm">Config Files</div>
                                </div>
                            </div>
                        )}

                        {/* Issue Summary */}
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${issues.length === 0 ? 'text-green-400' : 'text-white'}`}>
                                    {issues.length}
                                </div>
                                <div className="text-gray-400 text-sm">Total Issues</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${computedPriorityBreakdown[1] === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {computedPriorityBreakdown[1]}
                                </div>
                                <div className="text-gray-400 text-sm">Critical</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${computedPriorityBreakdown[2] === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {computedPriorityBreakdown[2]}
                                </div>
                                <div className="text-gray-400 text-sm">Major</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${computedPriorityBreakdown[3] === 0 ? 'text-green-400' : 'text-blue-400'}`}>
                                    {computedPriorityBreakdown[3]}
                                </div>
                                <div className="text-gray-400 text-sm">Minor</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Warnings */}
            {project_stats?.security_warnings && project_stats.security_warnings.length > 0 && (
                <div className="card p-6 border border-yellow-500/30 bg-yellow-500/10">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Security Notice
                    </h3>
                    
                    {project_stats.security_warnings.map((warning, index) => (
                        <div key={index} className="mb-6 last:mb-0">
                            <h4 className="text-yellow-300 font-semibold mb-2">{warning.type === 'skipped_files' ? 'Skipped Files' : warning.type}</h4>
                            <p className="text-yellow-200 mb-3">{warning.message}</p>
                            
                            {warning.files && warning.files.length > 0 && (
                                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                                    <h5 className="text-yellow-300 text-sm font-semibold mb-2">Skipped Files:</h5>
                                    <div className="space-y-3">
                                        {warning.files.map((file, fileIndex) => (
                                            <div key={fileIndex} className="text-yellow-100 text-sm">
                                                <div className="font-mono text-xs bg-yellow-500/30 px-2 py-1 rounded mb-1">
                                                    {file}
                                                </div>
                                                <div className="text-yellow-200 text-xs">
                                                    <strong>Why:</strong> Potentially unsafe file type
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {warning.files.length < project_stats.skipped_files && (
                                        <p className="text-yellow-300 text-xs mt-2">
                                            ... and {project_stats.skipped_files - warning.files.length} more files
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                        <h5 className="text-blue-300 text-sm font-semibold mb-2">💡 Why This Matters</h5>
                        <p className="text-blue-100 text-sm">
                            These security checks protect both your project and our analysis system. 
                            Skipped files don't affect your code analysis - we can still find issues in your source code!
                        </p>
                    </div>
                </div>
            )}

            {/* Issues Section */}
            <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Detected Issues</h3>
                    <span className="text-gray-400 text-sm">
                        {issues.length} issue{issues.length !== 1 ? 's' : ''} found
                    </span>
                </div>

                {issues.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <p className="text-xl text-gray-300 mb-2">No issues found!</p>
                        <p className="text-gray-400">Your project follows best practices.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {issues.map((issue, index) => (
                            <div key={index} className="bg-dark-700/50 rounded-xl p-6 border border-dark-600 hover:border-dark-500 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        {getPriorityBadge(issue)}
                                        <h4 className="text-lg font-semibold text-white flex-1">{issue.title}</h4>
                                        {issue.llm_enhanced && (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                                                AI Enhanced
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Problem Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <h5 className="font-semibold text-red-400">Problem</h5>
                                        </div>
                                        <div className="bg-dark-800 rounded-lg p-4 border border-red-500/20">
                                            <p className="text-gray-300 mb-2">{issue.description}</p>
                                            {issue.file && issue.file !== 'project-root' && (
                                                <div className="text-sm text-gray-400 mt-3">
                                                    <strong className="text-gray-300">Location:</strong>{' '}
                                                    <code className="bg-dark-900 px-2 py-1 rounded text-red-300">{issue.file}</code>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* LLM Enhanced Sections */}
                                    {issue.llm_enhanced && issue.root_cause && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h5 className="font-semibold text-blue-400">Root Cause</h5>
                                            </div>
                                            <div className="bg-dark-800 rounded-lg p-4 border border-blue-500/20">
                                                <p className="text-gray-300">{issue.root_cause}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Solution Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h5 className="font-semibold text-green-400">
                                                {issue.llm_enhanced ? 'Detailed Solution' : 'Solution'}
                                            </h5>
                                        </div>
                                        <div className="bg-dark-800 rounded-lg p-4 border border-green-500/20">
                                            {issue.llm_enhanced && issue.detailed_solution ? (
                                                <div className="space-y-3">
                                                    <p className="text-gray-300 whitespace-pre-line">{issue.detailed_solution}</p>
                                                    {issue.commands && issue.commands.length > 0 && (
                                                        <div className="space-y-2 mt-4">
                                                            <p className="text-sm text-gray-400 font-semibold">Quick Commands:</p>
                                                            {issue.commands.map((cmd, cmdIndex) => (
                                                                <div key={cmdIndex} className="flex items-center space-x-2">
                                                                    <span className="text-green-400 text-sm">$</span>
                                                                    <code className="flex-1 bg-dark-900 text-green-300 px-3 py-2 rounded text-sm font-mono">
                                                                        {cmd}
                                                                    </code>
                                                                    <button
                                                                        onClick={() => copyToClipboard(cmd)}
                                                                        className="text-gray-400 hover:text-white transition-colors p-1"
                                                                        title="Copy command"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-gray-300">{getSolutionText(issue)}</p>
                                                    {issue.commands && issue.commands.length > 0 && (
                                                        <div className="space-y-2">
                                                            {issue.commands.map((cmd, cmdIndex) => (
                                                                <div key={cmdIndex} className="flex items-center space-x-2">
                                                                    <span className="text-green-400 text-sm">$</span>
                                                                    <code className="flex-1 bg-dark-900 text-green-300 px-3 py-2 rounded text-sm font-mono">
                                                                        {cmd}
                                                                    </code>
                                                                    <button
                                                                        onClick={() => copyToClipboard(cmd)}
                                                                        className="text-gray-400 hover:text-white transition-colors p-1"
                                                                        title="Copy command"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prevention Tips */}
                                    {issue.llm_enhanced && issue.prevention && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                                <h5 className="font-semibold text-purple-400">Prevention Tips</h5>
                                            </div>
                                            <div className="bg-dark-800 rounded-lg p-4 border border-purple-500/20">
                                                <p className="text-gray-300">{issue.prevention}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Timestamp */}
            {timestamp && (
                <div className="text-center text-gray-500 text-sm">
                    Analysis completed {new Date(timestamp).toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default ResultsDashboard;