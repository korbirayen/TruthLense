import React, { useState, useEffect } from 'react';
import { Camera, FileText, Upload, AlertTriangle, Clock, Shield, User, LogOut } from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:5000/api";

// --- COMPONENTS ---

// 1. Navigation Bar
const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => (
  <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50 w-full">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" 
          onClick={() => setActiveTab('upload')}
        >
          <Shield className="h-8 w-8 text-blue-300" />
          <span className="font-bold text-xl tracking-tight">TruthLens</span>
        </div>
        
        {/* Desktop Navigation */}
        {user && (
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'upload' 
                  ? 'bg-blue-800 text-white shadow-sm' 
                  : 'text-blue-200 hover:bg-blue-600 hover:text-white'
              }`}
            >
              Verify
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'history' 
                  ? 'bg-blue-800 text-white shadow-sm' 
                  : 'text-blue-200 hover:bg-blue-600 hover:text-white'
              }`}
            >
              History
            </button>
          </div>
        )}

        {/* User Profile / Logout */}
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-200 text-sm bg-blue-800/50 py-1 px-3 rounded-full">
              <User size={16} />
              <span className="font-medium">{user.name}</span>
            </div>
            <button 
              onClick={onLogout} 
              className="p-2 rounded-full text-blue-200 hover:text-white hover:bg-blue-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="text-sm text-blue-200 font-medium bg-blue-800/30 px-3 py-1 rounded-full">
            Prototype Mode
          </div>
        )}
      </div>
    </div>
  </nav>
);

// 2. Login Screen
const LoginScreen = ({ onLogin }) => (
  // FIXED: Added inline styles to force centering and background color
  <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
    <div className="sm:mx-auto sm:w-full sm:max-w-md" style={{ width: '100%', maxWidth: '28rem', textAlign: 'center' }}>
      <div className="flex justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Shield className="h-12 w-12 text-blue-600" />
        </div>
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-black">TruthLens</h2>
      <p className="mt-2 text-center text-sm text-black">
        AI-Powered Misinformation Detection & Forensic Analysis
      </p>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" style={{ width: '100%', maxWidth: '28rem', marginTop: '2rem' }}>
      <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-100" style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-900">Email address</label>
            <div className="mt-1">
              {/* FIXED: 
                  1. Changed bg-white to bg-blue-50 (Light Blue Background) 
                  2. Added opacity-100 to force text visibility 
                  3. Changed text color to Dark Blue 
              */}
              <input 
                type="email" 
                defaultValue="demo@truthlens.ai" 
                readOnly 
                className="appearance-none block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm placeholder-blue-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50 text-blue-900 opacity-100"
                style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', borderColor: '#93c5fd', borderWidth: '1px', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', opacity: 1 }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-900">Password</label>
            <div className="mt-1">
               {/* FIXED: Same fix as email input */}
              <input 
                type="password" 
                defaultValue="password" 
                readOnly 
                className="appearance-none block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm placeholder-blue-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-blue-50 text-blue-900 opacity-100"
                style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', borderColor: '#93c5fd', borderWidth: '1px', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', opacity: 1 }}
              />
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02]"
            style={{ backgroundColor: '#2563eb', color: '#ffffff', width: '100%', padding: '0.75rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', border: 'none', fontWeight: '500' }}
          >
            Sign in to Dashboard
          </button>
          
          <div className="text-xs text-center text-blue-600 mt-4 bg-blue-50 p-2 rounded border border-blue-200 font-medium">
            ℹ️ Hackathon Demo Access Enabled
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 3. Result Card Component
const ResultCard = ({ result }) => {
  if (!result) return null;

  const isFake = result.analysis?.label === 'Fake' || result.analysis?.verdict === 'Tampering Detected';
  const isReal = result.analysis?.label === 'Real' || result.analysis?.verdict === 'Original';
  
  // Dynamic border color based on verdict
  const borderColor = isFake ? 'border-red-500' : isReal ? 'border-green-500' : 'border-yellow-500';
  const badgeColor = isFake ? 'bg-red-100 text-red-800' : isReal ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  const iconColor = isFake ? 'text-red-500' : isReal ? 'text-green-500' : 'text-yellow-500';

  return (
    <div className={`bg-white overflow-hidden shadow-lg rounded-lg border-l-4 ${borderColor} mt-8 transition-all duration-500 ease-in-out transform translate-y-0 opacity-100`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
            <Shield className={`h-5 w-5 ${iconColor}`} />
            Analysis Report
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
              {result.type === 'text' ? result.analysis.label : result.analysis.verdict}
            </span>
          </h3>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock size={14} />
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="mt-4">
          {result.type === 'text' ? (
            // TEXT RESULT
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Statement</p>
                <div className="mt-2 text-lg text-gray-900 italic bg-white p-6 rounded-md border-2 border-gray-200 shadow-sm">
                  "{result.content}"
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-6 rounded-md border-2 border-blue-100">
                  <span className="text-sm font-bold text-blue-800 uppercase tracking-wider">Confidence Score</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-blue-700">{result.analysis.confidence}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-4 mt-4">
                    <div className="bg-blue-600 h-4 rounded-full transition-all duration-1000" style={{ width: `${result.analysis.confidence}%` }}></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-md border-2 border-gray-200">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">AI Reasoning</span>
                  <p className="mt-2 text-lg text-gray-800 leading-relaxed font-medium">{result.analysis.explanation}</p>
                </div>
              </div>

              {result.analysis.historical_context && (
                <div className="bg-gray-50 p-6 rounded-md border-2 border-gray-200 mt-4">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Historical Context</span>
                  <p className="mt-2 text-lg text-gray-800 leading-relaxed font-medium">{result.analysis.historical_context}</p>
                </div>
              )}

              {result.analysis.sources && result.analysis.sources.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-md border-2 border-gray-200 mt-4">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Sources</span>
                  <ul className="mt-2 text-lg text-gray-800 list-disc list-inside font-medium">
                    {result.analysis.sources.map((source, idx) => (
                      <li key={idx}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // IMAGE RESULT
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Metadata Forensics</p>
                  <dl className="bg-gray-50 rounded-md p-6 border-2 border-gray-200 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-xs font-bold text-gray-600 uppercase">Camera Model</dt>
                      <dd className="mt-1 text-lg text-gray-900 font-bold">{result.analysis.exif_metadata?.camera || 'N/A'}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-xs font-bold text-gray-600 uppercase">Software Signature</dt>
                      <dd className="mt-1 text-lg text-gray-900 font-bold">{result.analysis.exif_metadata?.software || 'Unknown'}</dd>
                    </div>
                  </dl>
                  
                  <div className="mt-4 bg-gray-50 p-6 rounded-md border-2 border-gray-200">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Authenticity Score</span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className={`text-5xl font-extrabold ${result.analysis.authenticity_score > 80 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.analysis.authenticity_score}/100
                      </span>
                      <span className="text-sm text-gray-500 font-medium">Calculated by TruthLens Engine</span>
                    </div>
                     <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                      <div className={`h-4 rounded-full transition-all duration-1000 ${result.analysis.authenticity_score > 80 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${result.analysis.authenticity_score}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3 bg-gray-50 flex flex-col">
                   <p className="text-xs font-bold text-gray-500 uppercase mb-2">Tamper Map Visualization</p>
                   <div className="relative h-48 w-full bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden group">
                     {/* Mock Heatmap Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-red-500/20 group-hover:opacity-75 transition-opacity"></div>
                     <div className="text-center z-10">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                        <span className="text-gray-400 text-xs">Forensic Overlay Active</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Main Upload Page
const UploadPage = ({ onResult }) => {
  const [activeMode, setActiveMode] = useState('text'); // 'text' or 'image'
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeMode === 'text') {
          if (!inputText.trim()) throw new Error("Please enter text to analyze.");
          
          const response = await fetch(`${API_BASE_URL}/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to verify claim');
          }

          const data = await response.json();
          
          // Map backend response to frontend format
          const confidenceValue = parseInt(data.confidence.replace('%', '')) || 0;
          let label = 'Unknown';
          if (data.verdict === 'TRUE') label = 'Real';
          else if (data.verdict === 'FALSE') label = 'Fake';
          else if (data.verdict === 'MIXED') label = 'Mixed';
          else label = 'Unverifiable';

          onResult({
              id: Date.now(), 
              timestamp: new Date(), 
              type: 'text', 
              content: inputText,
              analysis: { 
                label: label, 
                verdict: data.verdict,
                confidence: confidenceValue,
                explanation: data.explanation,
                historical_context: data.historical_context,
                sources: data.sources
              }
          });
      } else {
           if (!selectedFile) throw new Error("Please select an image.");
           
           const formData = new FormData();
           formData.append('image', selectedFile);

           const response = await fetch(`${API_BASE_URL}/analyze-image`, {
             method: 'POST',
             body: formData,
           });

           if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error || 'Failed to analyze image');
           }

           const data = await response.json();
           
           onResult({
              id: Date.now(), 
              timestamp: new Date(), 
              type: 'image',
              analysis: { 
                verdict: data.verdict, 
                authenticity_score: data.authenticity_score, 
                exif_metadata: data.exif_metadata 
              }
          });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveMode('text')}
              className={`${
                activeMode === 'text'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } w-1/2 py-6 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200`}
            >
              <FileText size={20} />
              <span className="text-base">Verify Text</span>
            </button>
            <button
              onClick={() => setActiveMode('image')}
              className={`${
                activeMode === 'image'
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              } w-1/2 py-6 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200`}
            >
              <Camera size={20} />
              <span className="text-base">Analyze Image</span>
            </button>
          </nav>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            {activeMode === 'text' ? (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700">Paste news article or claim</label>
                <textarea
                  rows={6}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-lg p-4 border resize-none bg-white text-gray-900 placeholder-blue-500"
                  placeholder="e.g., 'Scientists confirm that drinking 5 liters of coffee daily grants immortality...'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700">Upload suspect image</label>
                <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors bg-gray-50/30 cursor-pointer group">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-16 w-16 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <Upload className="h-16 w-16" />
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {selectedFile && (
                      <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Shield size={14} className="mr-1"/> {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2 border border-red-100">
                <AlertTriangle size={16}/> {error}
              </div>
            )}

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing with {activeMode === 'text' ? 'LLM Engine' : 'Forensic Toolkit'}...
                  </span>
                ) : (
                  `Analyze ${activeMode === 'text' ? 'Statement' : 'Image'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 5. History Page
const HistoryPage = ({ history, onClearHistory }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="text-blue-600" /> Session History
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} className="rotate-180" /> Clear History
          </button>
        )}
      </div>
      <div className="space-y-6">
        {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                <p>No history yet. Verify a claim to see it here.</p>
            </div>
        ) : (
            history.map((item, idx) => (
            <ResultCard key={idx} result={item} />
            ))
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const INITIAL_HISTORY = [
  {
    id: 'hist-1',
    type: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    content: "The Great Wall of China is visible from space with the naked eye.",
    analysis: {
      label: "Fake",
      verdict: "FALSE",
      confidence: 98,
      explanation: "This is a common myth. NASA astronauts have confirmed that the Great Wall is not visible from low Earth orbit without aid, and certainly not from the moon. It is too narrow and blends in with the natural terrain.",
      historical_context: "The myth dates back to at least 1932 in a Ripley's Believe It or Not! cartoon, long before space travel was possible.",
      sources: ["NASA", "Scientific American", "Snopes"]
    }
  },
  {
    id: 'hist-2',
    type: 'text',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    content: "Napoleon Bonaparte was extremely short.",
    analysis: {
      label: "Fake",
      verdict: "FALSE",
      confidence: 92,
      explanation: "Napoleon was actually slightly taller than the average Frenchman of his time. The confusion stems from the difference between French and British measurement units (French inches were longer) and British propaganda depicting him as 'Little Boney'.",
      historical_context: "At his death, he measured 5 feet 2 inches in French units, which equates to about 5 feet 7 inches (1.69m) in modern international units.",
      sources: ["History.com", "Encyclopedia Britannica"]
    }
  },
  {
    id: 'hist-3',
    type: 'image',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    analysis: {
      verdict: "Tampering Detected",
      authenticity_score: 12,
      exif_metadata: { camera: "Unknown", software: "Adobe Photoshop 24.1" }
    }
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState(INITIAL_HISTORY);

  // --- 1. AUTO-INJECT TAILWIND FOR LOCALHOST ---
  useEffect(() => {
    const scriptId = 'tailwind-cdn';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const handleLogin = () => {
    setUser({ name: "Jane Doe", role: "Fact Checker" });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentResult(null);
    setActiveTab('upload');
  };

  const handleAnalysisResult = (result) => {
    setCurrentResult(result);
    setHistory(prev => [result, ...prev]);
  };

  return (
    <>
      {/* --- 2. CRITICAL FIX: OVERRIDE DEFAULT LOCAL STYLES --- 
          This style block forces the browser to ignore the default 
          settings that are squishing your app into the center. */}
      <style>{`
        html {
          font-size: 20px; /* PROJECTOR MODE: Scale up entire UI by 25% */
        }
        body {
          display: block !important;
          place-items: unset !important;
          min-width: unset !important;
          padding: 0 !important;
          margin: 0 !important;
          background-color: #f3f4f6 !important; /* Matches Tailwind bg-gray-100 */
        }
        #root {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          text-align: left !important;
        }
      `}</style>

      {/* MAIN RENDER LOGIC */}
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <div className="min-h-screen w-full bg-gray-100 font-sans text-slate-900">
          <Navbar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setCurrentResult(null); }} user={user} onLogout={handleLogout} />
          
          <main className="w-full">
            {activeTab === 'upload' && (
              <div className="animate-fade-in-up pb-20">
                <UploadPage onResult={handleAnalysisResult} />
                {currentResult && (
                  <div className="max-w-3xl mx-auto px-4">
                    <ResultCard result={currentResult} />
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'history' && (
              <HistoryPage history={history} onClearHistory={() => setHistory([])} />
            )}
          </main>
        </div>
      )}
    </>
  );
}