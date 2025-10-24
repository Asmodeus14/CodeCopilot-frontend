import React, { useState } from 'react';
import Logo from './Logo';

const ResultsDashboard = ({ analysisResults, onReset, processingTime }) => {
    const [copiedCommand, setCopiedCommand] = useState(null);
    const [copiedSummary, setCopiedSummary] = useState(false);

    // Add safe destructuring with defaults
    const { 
        health_score = 0, 
        issues = [], 
        summary = {}, 
        project_stats = {}, 
        llm_enhanced = false, 
        timestamp,
        performance = {},
        llm_available = false
    } = analysisResults || {};

    // Compute priority breakdown if not provided
    const computedPriorityBreakdown = summary.priority_breakdown || {
        1: issues.filter(issue => issue.priority === 1 || issue.severity === 'high').length,
        2: issues.filter(issue => issue.priority === 2 || issue.severity === 'medium').length,
        3: issues.filter(issue => issue.priority === 3 || issue.severity === 'low').length
    };

    // Get processing time from performance data or props
    const totalProcessingTime = performance?.total_duration_seconds || processingTime || 0;

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getPriorityBadge = (issue) => {
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
        if (score >= 80) return { 
            message: 'Excellent! Your project is in great shape.', 
            emoji: '🎉',
            description: 'Your code follows best practices and has minimal issues.'
        };
        if (score >= 60) return { 
            message: 'Good! Some improvements can be made.', 
            emoji: '👍',
            description: 'Your project is solid but could benefit from some optimizations.'
        };
        if (score >= 40) return { 
            message: 'Needs attention. Review the issues below.', 
            emoji: '⚠️',
            description: 'There are some important issues that should be addressed.'
        };
        return { 
            message: 'Requires immediate fixes. Critical issues found.', 
            emoji: '🚨',
            description: 'Critical issues detected that need immediate attention.'
        };
    };

    const healthInfo = getHealthMessage(health_score);

    const copyToClipboard = async (text, type = 'command') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'command') {
                setCopiedCommand(text);
                setTimeout(() => setCopiedCommand(null), 2000);
            } else if (type === 'summary') {
                setCopiedSummary(true);
                setTimeout(() => setCopiedSummary(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const copySummary = () => {
        const summaryText = `
🏥 Project Health Score: ${health_score}/100
📊 Total Issues: ${issues.length}
🚨 Critical: ${computedPriorityBreakdown[1]}
⚠️ Major: ${computedPriorityBreakdown[2]}
💡 Minor: ${computedPriorityBreakdown[3]}
📁 Files Analyzed: ${project_stats?.total_files || 0}
⏱️ Processing Time: ${totalProcessingTime}s

${healthInfo.message}

Analyzed with CodeCopilot 🚀
        `.trim();
        
        copyToClipboard(summaryText, 'summary');
    };

    const shareOnTwitter = () => {
        const tweetText = `My project scored ${health_score}/100 on CodeCopilot! 🚀\n\nFound ${issues.length} issues with ${computedPriorityBreakdown[1]} critical ones.\n\n#CodeQuality #WebDev #CodeCopilot`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    // Get solution text - prioritize AI-enhanced solutions
    const getSolutionText = (issue) => {
        if (issue.llm_enhanced && issue.detailed_solution) {
            return issue.detailed_solution;
        }
        return issue.solution || issue.fix || 'No solution provided.';
    };

    // Check if solution is AI-generated
    const isAISolution = (issue) => {
        return issue.llm_enhanced || issue.ai_analyzed;
    };

    // Get fun facts based on health score
    const getFunFact = (score) => {
        const facts = [
            "Projects with health scores above 80% are 3x less likely to have production issues! 🚀",
            "Regular code analysis can reduce bug-fixing time by up to 40%! 🐛",
            "Well-structured projects are 60% faster to onboard new developers! 👥",
            "Projects with good test coverage have 85% fewer regressions! ✅",
            "Proper dependency management prevents 90% of security vulnerabilities! 🔒"
        ];
        
        if (score >= 80) return facts[0];
        if (score >= 60) return facts[1];
        if (score >= 40) return facts[2];
        return facts[3];
    };

    // Get performance insights
    const getPerformanceInsights = () => {
        if (!performance) return null;

        const insights = [];
        
        if (performance.early_termination) {
            insights.push("Analysis was optimized and stopped early after finding critical issues for faster results ⚡");
        }
        
        if (performance.files_processed > 1000) {
            insights.push(`Processed ${performance.files_processed} files in ${totalProcessingTime}s - that's impressive scale! 📊`);
        }
        
        if (totalProcessingTime < 5) {
            insights.push("Lightning-fast analysis! Your project was processed in record time 🏃‍♂️");
        }

        return insights.length > 0 ? insights : [`Analysis completed in ${totalProcessingTime}s`];
    };

    // Tech stack display
    const renderTechStack = () => {
        if (!project_stats?.tech_stack) return null;

        const { tech_stack } = project_stats;
        const hasTech = Object.values(tech_stack).some(stack => stack.length > 0);

        if (!hasTech) return null;

        return (
            <div className="card p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center">
                    <span className="mr-2">🛠️</span>
                    Technology Stack
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tech_stack.frontend.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2">Frontend</h4>
                            <div className="flex flex-wrap gap-2">
                                {tech_stack.frontend.map((tech, index) => (
                                    <span key={index} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-500/30">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {tech_stack.backend.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2">Backend</h4>
                            <div className="flex flex-wrap gap-2">
                                {tech_stack.backend.map((tech, index) => (
                                    <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {tech_stack.build_tools.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2">Build Tools</h4>
                            <div className="flex flex-wrap gap-2">
                                {tech_stack.build_tools.map((tech, index) => (
                                    <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {tech_stack.testing.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-300 mb-2">Testing</h4>
                            <div className="flex flex-wrap gap-2">
                                {tech_stack.testing.map((tech, index) => (
                                    <span key={index} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm border border-green-500/30">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // AI Improvement Suggestions
    const renderImprovementSuggestions = () => {
        if (!project_stats?.improvement_suggestions) return null;

        return (
            <div className="card p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                    <span className="mr-2">🧠</span>
                    AI Improvement Suggestions
                </h3>
                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                    <p className="text-emerald-300 whitespace-pre-line text-sm leading-relaxed">
                        {project_stats.improvement_suggestions}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Logo className="h-8 mb-2" />
                    <h2 className="text-3xl font-bold text-white mt-2">Analysis Results</h2>
                    {timestamp && (
                        <p className="text-gray-400 text-sm">
                            Analyzed {new Date(timestamp).toLocaleString()}
                            {totalProcessingTime > 0 && ` • ${totalProcessingTime}s processing`}
                        </p>
                    )}
                </div>
                <button 
                    className="btn-secondary whitespace-nowrap"
                    onClick={onReset}
                >
                    Analyze New Project
                </button>
            </div>

            {/* Performance & AI Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* AI Status */}
                {llm_available && (
                    <div className="card p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">🧠</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-400">
                                    {llm_enhanced ? 'AI-Powered Analysis' : 'AI Analysis Available'}
                                </h3>
                                <p className="text-green-300 text-sm">
                                    {llm_enhanced 
                                        ? 'Enhanced with Gemini AI insights and solutions' 
                                        : 'Enable AI for detailed solutions and prevention tips'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Insights */}
                {performance && (
                    <div className="card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">⚡</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-400">Performance</h3>
                                <p className="text-blue-300 text-sm">
                                    {getPerformanceInsights()?.[0] || 'Optimized analysis completed'}
                                    {performance.files_processed && ` • ${performance.files_processed} files`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fun Fact */}
            <div className="card p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <div className="flex items-start space-x-3">
                    <span className="text-lg mt-0.5">💡</span>
                    <div>
                        <h4 className="font-semibold text-purple-400 mb-1">Did You Know?</h4>
                        <p className="text-purple-300 text-sm">{getFunFact(health_score)}</p>
                    </div>
                </div>
            </div>

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
                            <div>
                                <p className="text-lg text-gray-300">{healthInfo.message}</p>
                                <p className="text-gray-400 text-sm">{healthInfo.description}</p>
                            </div>
                        </div>
                        
                        {/* Project Stats */}
                        {project_stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{project_stats.total_files || 0}</div>
                                    <div className="text-gray-400 text-sm">Total Files</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{project_stats.package_files || 0}</div>
                                    <div className="text-gray-400 text-sm">Packages</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{project_stats.config_files || 0}</div>
                                    <div className="text-gray-400 text-sm">Configs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">
                                        {project_stats.size_analysis?.total_size_mb || '0'}
                                    </div>
                                    <div className="text-gray-400 text-sm">Size (MB)</div>
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

            {/* Tech Stack */}
            {renderTechStack()}

            {/* AI Improvement Suggestions */}
            {renderImprovementSuggestions()}

            {/* Share Results Call-to-Action */}
            <div className="card p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-400">Share Your Results</h4>
                            <p className="text-indigo-300 text-sm">
                                Proud of your score? Share it with your team!
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            className={`btn-secondary text-sm ${copiedSummary ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={copySummary}
                        >
                            {copiedSummary ? '✅ Copied!' : '📋 Copy Summary'}
                        </button>
                        <button 
                            className="btn-primary text-sm bg-indigo-600 hover:bg-indigo-700"
                            onClick={shareOnTwitter}
                        >
                            🐦 Share on Twitter
                        </button>
                    </div>
                </div>
            </div>

            {/* Issues Section */}
            <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Detected Issues</h3>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-400 text-sm">
                            {issues.length} issue{issues.length !== 1 ? 's' : ''} found
                        </span>
                        {llm_enhanced && (
                            <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
                                🧠 AI Enhanced
                            </span>
                        )}
                    </div>
                </div>

                {issues.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <p className="text-xl text-gray-300 mb-2">No issues found!</p>
                        <p className="text-gray-400">Your project follows best practices.</p>
                        <div className="mt-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-green-300 text-sm">
                                <strong>Well done!</strong> Your code quality is exceptional. Keep up the great work!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {issues.map((issue, index) => (
                            <div key={index} className="bg-dark-700/50 rounded-xl p-6 border border-dark-600 hover:border-dark-500 transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        {getPriorityBadge(issue)}
                                        <h4 className="text-lg font-semibold text-white flex-1">{issue.title}</h4>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {isAISolution(issue) && (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full flex items-center">
                                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                                AI Powered
                                            </span>
                                        )}
                                        {issue.llm_enhanced && (
                                            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                                                Enhanced
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

                                    {/* AI-Enhanced Sections - FIXED: This was the missing section! */}
                                    {isAISolution(issue) && (
                                        <>
                                            {/* Root Cause - Show only if we have AI content */}
                                            {(issue.root_cause || issue.llm_enhanced) && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <h5 className="font-semibold text-blue-400">Root Cause Analysis</h5>
                                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">AI</span>
                                                    </div>
                                                    <div className="bg-dark-800 rounded-lg p-4 border border-blue-500/20">
                                                        <p className="text-gray-300">
                                                            {issue.root_cause || "AI analysis identified the underlying cause of this issue."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Solution Section */}
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <h5 className="font-semibold text-green-400">AI-Powered Solution</h5>
                                                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">Gemini</span>
                                                </div>
                                                <div className="bg-dark-800 rounded-lg p-4 border border-green-500/20">
                                                    <div className="space-y-3">
                                                        <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                                                            {getSolutionText(issue)}
                                                        </p>
                                                        
                                                        {/* Quick Commands */}
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
                                                                            {copiedCommand === cmd ? (
                                                                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                                </svg>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prevention Tips */}
                                            {(issue.prevention || issue.llm_enhanced) && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        <h5 className="font-semibold text-purple-400">Prevention Tips</h5>
                                                        <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">AI</span>
                                                    </div>
                                                    <div className="bg-dark-800 rounded-lg p-4 border border-purple-500/20">
                                                        <p className="text-gray-300">
                                                            {issue.prevention || "Follow these best practices to prevent similar issues in the future."}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Basic Solution (if not AI-enhanced) */}
                                    {!isAISolution(issue) && (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h5 className="font-semibold text-green-400">Solution</h5>
                                            </div>
                                            <div className="bg-dark-800 rounded-lg p-4 border border-green-500/20">
                                                <p className="text-gray-300">{getSolutionText(issue)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Next Steps & Call to Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Next Steps */}
                <div className="card p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-4 flex items-center">
                        <span className="mr-2">📝</span>
                        Next Steps
                    </h4>
                    <ul className="space-y-2 text-blue-300 text-sm">
                        <li>• Review critical issues first</li>
                        <li>• Implement the suggested solutions</li>
                        <li>• Re-run analysis after making changes</li>
                        <li>• Consider enabling AI for detailed insights</li>
                    </ul>
                </div>

                {/* Pro Tips */}
                <div className="card p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                    <h4 className="font-semibold text-amber-400 mb-4 flex items-center">
                        <span className="mr-2">💎</span>
                        Pro Tip
                    </h4>
                    <p className="text-amber-300 text-sm">
                        {health_score >= 80 
                            ? "Maintain your high score by running analysis before each major release!"
                            : "Fix critical issues first, then work on major and minor issues systematically."
                        }
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-4">
                <div className="text-gray-500 text-sm">
                    {timestamp && `Analysis completed ${new Date(timestamp).toLocaleString()}`}
                    {totalProcessingTime > 0 && ` • Processed in ${totalProcessingTime}s`}
                    {performance?.files_processed && ` • ${performance.files_processed} files analyzed`}
                </div>
                
                <div className="flex justify-center space-x-4">
                    <button 
                        className="text-gray-400 hover:text-white text-sm transition-colors"
                        onClick={onReset}
                    >
                        🔄 Analyze New Project
                    </button>
                    <button className="text-gray-400 hover:text-white text-sm transition-colors">
                        💡 Give Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;