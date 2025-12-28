import React, { useState } from 'react';
import { AudienceType, AppState, ResearchResult, GeneratedImage } from './types';
import InputSection from './components/InputSection';
import Dashboard from './components/Dashboard';
import { performResearch, structureResearchData, generateVisual } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    step: 'idle',
    error: null,
    researchResult: null,
    generatedImage: null,
  });

  const handleSearch = async (topic: string, audience: AudienceType) => {
    setState({
      isLoading: true,
      step: 'researching',
      error: null,
      researchResult: null,
      generatedImage: null,
    });

    try {
      // Step 1: Research with Grounding
      const researchData = await performResearch(topic, audience);
      
      setState(prev => ({ ...prev, step: 'structuring' }));

      // Step 2: Structure Data (Charts & Summaries)
      const structuredData = await structureResearchData(researchData.text, audience);
      
      // Combine sources from Step 1 with data from Step 2
      const fullResult: ResearchResult = {
        ...structuredData,
        groundingSources: researchData.sources
      };

      setState(prev => ({ 
        ...prev, 
        researchResult: fullResult,
        step: 'generating_image'
      }));

      // Step 3: Generate Image (Parallel-ish, but after we have the prompt)
      // We show the data immediately while image loads
      try {
        const image = await generateVisual(fullResult.imagePrompt);
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'complete',
          generatedImage: image
        }));
      } catch (imageError) {
        console.error("Image generation partial failure", imageError);
        // Don't fail the whole app if image fails, just show data
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'complete',
          // Keep existing null image
        }));
      }

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        step: 'error',
        error: error.message || "An unexpected error occurred."
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-50 selection:bg-blue-500/30">
      
      {/* Navbar / Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">V</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-100">VeriViz</span>
          </div>
          <div className="text-xs font-mono text-slate-500 flex items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
             Gemini 2.5/3.0 Powered
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center">
        
        <InputSection onSearch={handleSearch} isLoading={state.isLoading} />

        {state.error && (
           <div className="w-full max-w-2xl px-4 animate-in slide-in-from-top-4">
             <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start space-x-3">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <div>
                 <h3 className="font-semibold">Generation Failed</h3>
                 <p className="text-sm opacity-90">{state.error}</p>
               </div>
             </div>
           </div>
        )}

        {state.isLoading && (
          <div className="w-full max-w-4xl mt-8 px-4 text-center">
             <div className="inline-block relative">
                <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-blue-500 animate-progress"
                      style={{ 
                        width: state.step === 'researching' ? '30%' : 
                               state.step === 'structuring' ? '60%' : 
                               state.step === 'generating_image' ? '90%' : '100%',
                        transition: 'width 0.5s ease-in-out'
                      }}
                   ></div>
                </div>
                <p className="mt-4 text-slate-400 font-mono text-sm animate-pulse">
                   {state.step === 'researching' && "Scanning global database & verifying sources..."}
                   {state.step === 'structuring' && "Analyzing data points & structuring report..."}
                   {state.step === 'generating_image' && "Painting custom visualization..."}
                </p>
             </div>
          </div>
        )}

        <Dashboard 
          research={state.researchResult} 
          image={state.generatedImage}
          status={state.step}
        />

      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-8 mt-auto bg-slate-900">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
           <p>&copy; {new Date().getFullYear()} VeriViz. Powered by Google Gemini API.</p>
         </div>
      </footer>

    </div>
  );
};

export default App;
