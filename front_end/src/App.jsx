import React, { useState, useEffect } from 'react';
import { Camera, FileText, Upload, AlertTriangle, Clock, Shield, Search } from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:5000/api";

// --- COMPONENTS ---

// 1. Navigation Bar (Red/Black Theme)
const Navbar = ({ activeTab, setActiveTab }) => (
  <nav className="sticky top-0 z-50 w-full bg-black border-b-4 border-red-600 shadow-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('upload')}
        >
          <div className="bg-red-600 p-1.5 transition-transform group-hover:rotate-180 duration-500">
             <Shield className="h-8 w-8 text-white" />
          </div>
          <span className="font-black text-3xl tracking-tighter text-white">
            TRUTH<span className="text-red-600">LENS</span>
          </span>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2 text-sm font-black uppercase tracking-widest transition-all duration-200 border-2 ${
              activeTab === 'upload' 
                ? 'bg-red-600 text-white border-red-600' 
                : 'text-white border-transparent hover:border-red-600'
            }`}
          >
            Verify
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 text-sm font-black uppercase tracking-widest transition-all duration-200 border-2 ${
              activeTab === 'history' 
                ? 'bg-red-600 text-white border-red-600' 
                : 'text-white border-transparent hover:border-red-600'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </div>
  </nav>
);

// 2. Result Card Component (High Contrast Red/Black)
const ResultCard = ({ result }) => {
  if (!result) return null;

  // Determine styles based on verdict
  // If "Fake" or "Tampering", use RED. If "Real", use BLACK (instead of Green).
  const isFake = result.analysis?.label === 'Fake' || result.analysis?.verdict === 'Tampering Detected';
  const cardBorder = isFake ? 'border-red-600' : 'border-black';
  const headerBg = isFake ? 'bg-red-600' : 'bg-black';
  const accentText = isFake ? 'text-red-600' : 'text-black';
  const barColor = isFake ? 'bg-red-600' : 'bg-black';

  // Optional dual-engine + meta info for text results
  const mlModel = result.analysis?.ml_model;
  const enginesDisagree = mlModel && mlModel.label && result.analysis?.label && mlModel.label !== result.analysis.label;
  const meta = result.analysis?.meta_analysis;

  return (
    <div className={`bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 ${cardBorder} mt-8 mb-8`}>
      {/* Header */}
      <div className={`${headerBg} px-6 py-4 flex justify-between items-center`}>
        <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Shield className="h-6 w-6" />
          Analysis Report
        </h3>
        <span className="bg-white text-black px-4 py-1 font-bold text-xs uppercase tracking-wider">
            {result.type === 'text' ? result.analysis.label : result.analysis.verdict}
        </span>
      </div>

      <div className="p-6 md:p-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
          <Clock size={14} />
          {new Date(result.timestamp).toLocaleTimeString()}
        </div>

        {result.type === 'text' ? (
          // TEXT RESULT
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase mb-2">Analyzed Statement</p>
              <div className="text-lg md:text-xl font-bold text-black border-l-4 border-gray-200 pl-4 py-1">
                "{result.content}"
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-black p-6 relative">
                <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-black uppercase tracking-wider">Confidence Score</span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-6xl font-black ${accentText}`}>{result.analysis.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 h-4 border-2 border-black">
                  <div className={`${barColor} h-full transition-all duration-1000`} style={{ width: `${result.analysis.confidence}%` }}></div>
                </div>
                {meta && (
                  <div className="mt-4 text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-bold">Combined Confidence:</span>{' '}
                      <span>{meta.combined_confidence_score}%</span>
                    </div>
                    {meta.engines_agree !== null && (
                      <div className="flex items-center gap-1">
                        {meta.engines_agree ? (
                          <span className="text-green-700 font-bold">Engines agree on this verdict.</span>
                        ) : (
                          <span className="text-red-700 font-bold">Engines conflict – treat this result with caution.</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase mb-2 block">AI Reasoning</span>
                  <p className="text-base font-medium text-black leading-relaxed">{result.analysis.explanation}</p>
                </div>
                {mlModel && (
                  <div className="border-2 border-black p-4 bg-gray-50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Local NLP Engine</span>
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Model Verdict</p>
                        <p className="text-sm font-bold text-black">{mlModel.label}</p>
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Model Confidence</p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-xl font-black text-black">{mlModel.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-3 border-2 border-black mt-1">
                          <div className="bg-black h-full" style={{ width: `${mlModel.confidence}%` }}></div>
                        </div>
                      </div>
                    </div>
                    {enginesDisagree && (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-red-700 font-bold">
                        <AlertTriangle size={14} />
                        <span>LLM and local NLP engine disagree on this claim. Manual review recommended.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {result.analysis.historical_context && (
              <div>
                <span className="text-xs font-bold text-black uppercase mb-2 block">Historical Context</span>
                <p className="text-base font-medium text-black leading-relaxed">{result.analysis.historical_context}</p>
              </div>
            )}

            {result.analysis.sources && result.analysis.sources.length > 0 && (
              <div>
                <span className="text-xs font-bold text-black uppercase mb-2 block">Sources</span>
                <ul className="text-sm font-medium text-black list-disc list-inside space-y-1">
                  {result.analysis.sources.map((source, idx) => (
                    <li key={idx}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          // IMAGE RESULT
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-red-600 uppercase mb-2">Metadata Forensics</p>
                <dl className="grid grid-cols-2 gap-4 border-2 border-black p-4">
                  <div>
                    <dt className="text-[10px] font-bold text-gray-400 uppercase">Camera Model</dt>
                    <dd className="text-sm font-bold text-black">{result.analysis.exif_metadata?.camera || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-gray-400 uppercase">Software Signature</dt>
                    <dd className="text-sm font-bold text-black">{result.analysis.exif_metadata?.software || 'Unknown'}</dd>
                  </div>
                </dl>
                
                <div className="mt-6">
                  <span className="text-xs font-bold text-black uppercase tracking-wider block mb-2">Authenticity Score</span>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-4xl font-black ${accentText}`}>
                      {result.analysis.authenticity_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-4 border-2 border-black">
                    <div className={`h-full border-r-2 border-white ${barColor}`} style={{ width: `${result.analysis.authenticity_score}%` }}></div>
                  </div>
                </div>

                {typeof result.analysis.ela_score !== 'undefined' && (
                  <div className="mt-6 border-2 border-black p-4 bg-gray-50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Visual Forensics (ELA)</span>
                    <p className="text-xs text-gray-700">
                      ELA Score: <span className="font-bold text-black">{result.analysis.ela_score}</span>
                    </p>
                    {result.analysis.ela_summary && (
                      <p className="mt-1 text-xs text-gray-800 leading-relaxed">{result.analysis.ela_summary}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                 <p className="text-xs font-bold text-red-600 uppercase mb-2">Tamper Map Visualization</p>
                 <div className="relative h-48 w-full bg-black border-2 border-black flex items-center justify-center overflow-hidden group">
                   {/* Mock Heatmap Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-transparent to-white/10 group-hover:opacity-75 transition-opacity"></div>
                   <div className="text-center z-10">
                      <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                      <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-2 py-1">Forensic Overlay Active</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. Main Upload Page (Red/Black Tabs & Inputs)
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
                sources: data.sources,
                ml_model: data.ml_model,
                meta_analysis: data.meta_analysis
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
                exif_metadata: data.exif_metadata,
                ela_score: data.ela_score,
                ela_summary: data.ela_summary
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
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Intro Text */}
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-black text-black mb-4 uppercase italic tracking-tighter">
          Verify <span className="text-red-600">Everything</span>
        </h1>
        <p className="text-lg font-bold text-gray-500 max-w-2xl mx-auto">
          Drag, drop, or paste to expose manipulation using our forensic engine.
        </p>
      </div>

      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(229,57,53,1)]">
        {/* Tabs */}
        <div className="flex border-b-4 border-black">
          <button
            onClick={() => setActiveMode('text')}
            className={`${
              activeMode === 'text'
                ? 'bg-black text-white'
                : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'
            } w-1/2 py-6 text-center font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 transition-colors duration-200`}
          >
            <FileText size={24} />
            Verify Text
          </button>
          <button
            onClick={() => setActiveMode('image')}
            className={`${
              activeMode === 'image'
                ? 'bg-black text-white'
                : 'bg-white text-gray-400 hover:text-black hover:bg-gray-50'
            } w-1/2 py-6 text-center font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 transition-colors duration-200 border-l-4 border-black`}
          >
            <Camera size={24} />
            Analyze Image
          </button>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            {activeMode === 'text' ? (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-bold text-black uppercase tracking-wider">Paste Content</label>
                <textarea
                  rows={6}
                  className="block w-full text-lg font-medium border-4 border-gray-200 p-4 resize-none bg-white text-black placeholder-gray-300 focus:border-red-600 focus:outline-none focus:ring-0 transition-colors"
                  placeholder="Paste article text, social media posts, or statements here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-bold text-black uppercase tracking-wider">Upload Evidence</label>
                <div className="mt-1 flex justify-center px-6 pt-12 pb-12 border-4 border-gray-200 border-dashed hover:border-red-600 transition-colors bg-gray-50 cursor-pointer group relative">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto h-16 w-16 text-gray-300 group-hover:text-red-600 transition-colors">
                      <Upload className="h-16 w-16" />
                    </div>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-black hover:text-red-600 uppercase tracking-wide focus-within:outline-none">
                        <span>Click to Upload</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase">PNG, JPG, WEBP up to 10MB</p>
                    {selectedFile && (
                      <div className="absolute top-2 right-2 px-3 py-1 bg-black text-white text-xs font-bold uppercase">
                        {selectedFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-600 text-white font-bold text-sm flex items-center gap-3">
                <AlertTriangle size={20}/> {error}
              </div>
            )}

            <div className="mt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-5 px-4 border-4 border-transparent hover:border-black bg-red-600 hover:bg-white text-white hover:text-red-600 font-black uppercase tracking-[0.2em] text-lg transition-all shadow-lg hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <span className="flex items-center gap-3 animate-pulse">
                     PROCESSING...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Analyze {activeMode === 'text' ? 'Statement' : 'Image'}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// 4. History Page (Red/Black)
const HistoryPage = ({ history }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-black text-black mb-8 flex items-center gap-3 uppercase tracking-tighter">
        <Clock className="text-red-600 h-8 w-8" /> Session History
      </h2>
      <div className="space-y-6">
        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 border-4 border-black">
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
      sources: ["NASA", "Scientific American", "Snopes"],
      ml_model: {
        label: "Fake",
        confidence: 95
      }
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
      sources: ["History.com", "Encyclopedia Britannica"],
      ml_model: {
        label: "Fake",
        confidence: 90
      }
    }
  },
  {
    id: 'hist-3',
    type: 'image',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    analysis: {
      verdict: "Tampering Detected",
      authenticity_score: 12,
      exif_metadata: { camera: "Unknown", software: "Adobe Photoshop 24.1" },
      ela_score: 0.8,
      ela_summary: "The image has been heavily edited, with multiple layers and adjustments made to the original file."
    }
  }
];

export default function App() {
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
          background-color: #ffffff !important;
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
      <div className="min-h-screen w-full bg-white font-sans selection:bg-red-600 selection:text-white">
        <Navbar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setCurrentResult(null); }} />
        
        <main className="w-full">
          {activeTab === 'upload' && (
            <div className="animate-fade-in-up pb-20">
              <UploadPage onResult={handleAnalysisResult} />
              {currentResult && (
                <div className="max-w-4xl mx-auto px-4">
                  <ResultCard result={currentResult} />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'history' && (
            <HistoryPage history={history} />
          )}
        </main>
      </div>
    </>
  );
}