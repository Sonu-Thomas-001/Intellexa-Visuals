import React from 'react';
import { ResearchResult, GeneratedImage, AppState } from '../types';
import ChartDisplay from './ChartDisplay';
import { ExternalLink, Image as ImageIcon, FileText, BarChart2, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  research: ResearchResult | null;
  image: GeneratedImage | null;
  status: AppState['step'];
}

const Dashboard: React.FC<DashboardProps> = ({ research, image, status }) => {
  if (!research) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Row: Summary & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Research Summary Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl flex flex-col">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-700 pb-4">
             <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
             </div>
             <h2 className="text-xl font-bold text-slate-100">Research Summary</h2>
             <div className="ml-auto flex items-center px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-green-400 mr-2" />
                <span className="text-xs font-medium text-green-400">Verified by Google Search</span>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 text-slate-300 leading-relaxed text-lg">
            {research.summary.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {research.groundingSources.length > 0 ? (
                research.groundingSources.map((source, idx) => (
                  <a 
                    key={idx} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-blue-300 transition-colors truncate max-w-[200px]"
                    title={source.title}
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5 shrink-0" />
                    <span className="truncate">{source.title}</span>
                  </a>
                ))
              ) : (
                <span className="text-slate-500 text-sm italic">No direct sources linked.</span>
              )}
            </div>
          </div>
        </div>

        {/* Visual / Image Card */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl flex flex-col h-full min-h-[400px]">
           <div className="flex items-center space-x-2 mb-4 border-b border-slate-700 pb-4">
             <div className="p-2 bg-purple-500/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-purple-400" />
             </div>
             <h2 className="text-xl font-bold text-slate-100">AI Illustration</h2>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden bg-slate-900 relative group">
            {image ? (
              <>
                 <img 
                    src={image.url} 
                    alt="Generated Visual" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-medium line-clamp-2">{research.imagePrompt}</p>
                  </div>
              </>
            ) : status === 'generating_image' ? (
               <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 animate-pulse">Generating custom visual...</p>
               </div>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-600">
                 <p>Waiting for generation...</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Data Visualization */}
      <div className="w-full h-[500px]">
         <div className="h-full bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-1 shadow-xl">
             <ChartDisplay 
               type={research.chartType}
               data={research.chartData}
               title={research.chartTitle}
               xAxisLabel={research.chartXAxis}
               yAxisLabel={research.chartYAxis}
             />
         </div>
      </div>

    </div>
  );
};

export default Dashboard;
