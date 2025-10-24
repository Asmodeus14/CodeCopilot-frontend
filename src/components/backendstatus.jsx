import React, { useState, useEffect } from "react";

const BackendStatus = () => {
  const [status, setStatus] = useState("checking");
  const [backendUrl, setBackendUrl] = useState("");
  const [llmStatus, setLlmStatus] = useState("unknown");
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        setBackendUrl(url);

        console.log(`🔍 Testing backend connection to: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const healthResponse = await fetch(`${url}/api/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        if (!healthResponse.ok) {
          throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
        }

        const healthData = await healthResponse.json();
        console.log("✅ Backend response:", healthData);

        setStatus("connected");

        // Check LLM status
        const llmAvailable = healthData.llm?.available || healthData.llm_available;
        const modelWorking = healthData.llm?.model_working || healthData.llm_model_available;

        setLlmStatus(llmAvailable && modelWorking ? "enabled" : "disabled");
        setErrorDetails("");

      } catch (error) {
        console.error("❌ Backend connection failed:", error);
        setStatus("error");
        
        if (error.name === 'AbortError') {
          setErrorDetails("Request timeout - backend is not responding");
        } else if (error.message.includes('Failed to fetch')) {
          setErrorDetails("Network error - backend may not be running");
        } else {
          setErrorDetails(error.message);
        }
      }
    };

    checkBackend();

    // Optional: Auto-retry every 10 seconds if failed
    const interval = setInterval(() => {
      if (status === "error") {
        checkBackend();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [status]);

  const StatusIndicator = () => {
    switch (status) {
      case "connected":
        return (
          <div className="flex items-center space-x-2 text-emerald-400">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="font-medium">Service Ready</span>
          </div>
        );
      case "error":
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
    if (llmStatus === "unknown") return null;

    return (
      <div className={`flex items-center space-x-1.5 text-xs ${llmStatus === "enabled" ? "text-emerald-300" : "text-amber-300"}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${llmStatus === "enabled" ? "bg-emerald-400" : "bg-amber-400"}`}></div>
        <span>AI {llmStatus === "enabled" ? "Active" : "Unavailable"}</span>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-dark-800/90 backdrop-blur-md border border-dark-600/50 rounded-xl p-4 text-sm shadow-2xl shadow-black/30 transform transition-all duration-500 ease-out animate-fadeIn">
      <div className="flex items-center space-x-4">
        <StatusIndicator />
        {llmStatus !== "unknown" && (
          <>
            <div className="h-4 w-px bg-dark-600"></div>
            <AIIndicator />
          </>
        )}
      </div>

      {status === "error" && (
        <div className="mt-3 relative overflow-hidden rounded-lg border border-rose-500/30 bg-gradient-to-br from-rose-950/60 via-dark-900/60 to-dark-800/40 backdrop-blur-sm p-3">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/40 via-transparent to-transparent blur opacity-30 animate-pulse"></div>
          <div className="relative flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 3h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-rose-300 font-medium">Backend Unreachable</p>
              <p className="text-dark-200/90 text-xs mt-1 leading-relaxed">
                {errorDetails || "The backend service is currently unavailable."}
                <br />
                <span className="text-dark-300/70">
                  URL: {backendUrl}
                  <br />
                  Please ensure the backend server is running.
                </span>
              </p>
              <button 
                onClick={() => setStatus("checking")}
                className="mt-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 rounded text-xs text-white transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BackendStatus;