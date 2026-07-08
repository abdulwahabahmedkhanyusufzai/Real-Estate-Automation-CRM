import React from 'react';
import type { Suggestion } from '../types';
import { Code, PenTool, Compass, BarChart2 } from 'lucide-react';


interface SuggestionCardsProps {
  onSelectSuggestion: (prompt: string) => void;
}

const suggestions: Suggestion[] = [
  {
    id: 's1',
    title: 'Qualify WhatsApp Lead 💬',
    subtitle: 'Parse informal chat: "hi, looking for 4b villa in dxb hills budget 3m urgent"',
    prompt: 'Qualify this WhatsApp lead: "hi, looking for 4b villa in dxb hills budget 3m urgent"',
    category: 'explore',
  },
  {
    id: 's2',
    title: 'Analyze Email Lead 📧',
    subtitle: 'Extract requirements and clean disclaimers from a formal email.',
    prompt: 'Extract lead details from this email: "Dear Team, I am looking to invest AED 5 Million in a high-end apartment in Downtown Dubai. Please find details attached. Regards, John (CEO)"',
    category: 'explore',
  },
  {
    id: 's3',
    title: 'Portal Lead Ingestion 🏠',
    subtitle: 'Isolate lead queries from standard Property Finder templates.',
    prompt: 'Parse this Property Finder lead inquiry template: "Inquiry for property REF-881. Client message: Interested in viewing this 3-bedroom townhouse in Arabian Ranches."',
    category: 'write',
  },
  {
    id: 's4',
    title: 'Dubai Hills Market Report 📊',
    subtitle: 'Ask the AI to generate a brief summary of transaction trends in Dubai Hills.',
    prompt: 'Provide a market overview of Dubai Hills estate, including average price ranges for villas.',
    category: 'analyze',
  },
];

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSelectSuggestion }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'code':
        return <Code className="w-5 h-5 text-purple-600" />;
      case 'write':
        return <PenTool className="w-5 h-5 text-emerald-600" />;
      case 'analyze':
        return <BarChart2 className="w-5 h-5 text-amber-600" />;
      default:
        return <Compass className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mx-auto px-4 mt-8 animate-scale-in">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelectSuggestion(suggestion.prompt)}
          className="group flex flex-col justify-between p-5 h-48 bg-white border border-slate-200/80 hover:border-[#01cb65]/30 hover:bg-slate-50/40 rounded-2xl text-left transition-all duration-300 ease-out cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1.5 relative overflow-hidden"
        >
          <div className="flex flex-col gap-2">
            <h3 className="font-extrabold text-slate-800 group-hover:text-[#01cb65] transition-colors text-base line-clamp-1">
              {suggestion.title}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
              {suggestion.subtitle}
            </p>
          </div>
          <div className="self-end p-2 bg-slate-50 border border-slate-150 rounded-xl group-hover:bg-white transition-colors">
            {getIcon(suggestion.category)}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#01cb65] to-[#00aed0] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </button>
      ))}
    </div>
  );
};
