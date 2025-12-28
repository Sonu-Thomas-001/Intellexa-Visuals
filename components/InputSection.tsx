import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { AUDIENCE_OPTIONS } from '../constants';
import { AudienceType } from '../types';

interface InputSectionProps {
  onSearch: (topic: string, audience: AudienceType) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSearch, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<AudienceType>(AudienceType.GENERAL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSearch(topic, audience);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Verified Visuals
        </h1>
        <p className="text-slate-400 text-lg">
          Research any topic and instantly generate fact-checked data visualizations & imagery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-6 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="block text-slate-400 text-sm font-medium mb-2">Research Topic</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Global Renewable Energy Trends 2024"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <label className="block text-slate-400 text-sm font-medium mb-2">Target Audience</label>
            <div className="relative">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as AudienceType)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                disabled={isLoading}
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className={`
              flex items-center justify-center space-x-2 px-8 py-3 rounded-xl text-white font-medium transition-all transform duration-200
              ${isLoading || !topic.trim() ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] shadow-lg shadow-blue-500/25 active:scale-95'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <span>Generate Report</span>
                <span className="text-xl">✨</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputSection;
