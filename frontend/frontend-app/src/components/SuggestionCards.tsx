import React from 'react';
import type { Suggestion } from '../types';
import { Code, PenTool, Compass, BarChart2 } from 'lucide-react';


interface SuggestionCardsProps {
  onSelectSuggestion: (prompt: string) => void;
}

const suggestions: Suggestion[] = [
  {
    id: 's1',
    title: 'Tell me about Lions 🦁',
    subtitle: 'Learn about the king of the jungle, their habitat, and hunting habits.',
    prompt: 'Tell me about lions, their natural habitat, social structure, and hunting habits.',
    category: 'explore',
  },
  {
    id: 's2',
    title: 'How tall are Giraffes? 🦒',
    subtitle: 'Explore fun facts about the tallest land mammal on Earth.',
    prompt: 'How tall are giraffes and how does their height help them survive in the wild?',
    category: 'explore',
  },
  {
    id: 's3',
    title: 'What do Pandas eat? 🐼',
    subtitle: 'Discover the daily diet and nutritional needs of giant pandas.',
    prompt: 'What do pandas eat? Tell me about their diet, how much they consume, and their favorite bamboo.',
    category: 'write',
  },
  {
    id: 's4',
    title: 'Penguin adaptations 🐧',
    subtitle: 'Find out how these flightless birds stay warm and swim so fast.',
    prompt: 'Tell me about penguins. What are their unique adaptations for swimming and surviving cold environments?',
    category: 'analyze',
  },
];

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSelectSuggestion }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'code':
        return <Code className="w-5 h-5 text-purple-400" />;
      case 'write':
        return <PenTool className="w-5 h-5 text-emerald-400" />;
      case 'analyze':
        return <BarChart2 className="w-5 h-5 text-amber-400" />;
      default:
        return <Compass className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mx-auto px-4 mt-8">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelectSuggestion(suggestion.prompt)}
          className="group flex flex-col justify-between p-5 h-48 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 rounded-2xl text-left transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col gap-2">
            <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors text-base line-clamp-1">
              {suggestion.title}
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
              {suggestion.subtitle}
            </p>
          </div>
          <div className="self-end p-2 bg-zinc-850 border border-zinc-800 rounded-xl group-hover:bg-zinc-700/50 transition-colors">
            {getIcon(suggestion.category)}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </button>
      ))}
    </div>
  );
};
