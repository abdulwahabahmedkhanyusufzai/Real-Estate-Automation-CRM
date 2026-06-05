import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MessageContentProps {
  content: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Regular expression to split code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  const renderTextWithBold = (text: string) => {
    // Split by ** to find bold text
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 text-sm sm:text-base text-[#e3e3e3] leading-relaxed">
      {parts.map((part, index) => {
        // If it's a code block
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.split('\n');
          const firstLine = lines[0].replace('```', '').trim();
          const language = firstLine || 'code';
          const code = lines.slice(1, -1).join('\n');

          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-zinc-800 bg-[#1e1f20] shadow-md">
              <div className="flex justify-between items-center px-4 py-2 bg-[#2c2d30] border-b border-zinc-800 text-xs font-mono text-zinc-400">
                <span className="uppercase">{language}</span>
                <button
                  onClick={() => copyToClipboard(code, index)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-zinc-100 bg-[#1e1f20] leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // If it's regular text, parse line-by-line for basic markdown elements
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-lg font-semibold text-white pt-4 pb-1">
                    {renderTextWithBold(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lineIdx} className="text-base font-medium text-white pt-2 pb-0.5">
                    {renderTextWithBold(trimmed.slice(5))}
                  </h4>
                );
              }
              if (trimmed.startsWith('* ')) {
                return (
                  <ul key={lineIdx} className="list-disc pl-6 py-0.5">
                    <li className="text-zinc-300">
                      {renderTextWithBold(trimmed.slice(2))}
                    </li>
                  </ul>
                );
              }
              if (trimmed.startsWith('1. ') || /^\d+\.\s/.test(trimmed)) {
                const contentStr = trimmed.replace(/^\d+\.\s/, '');
                return (
                  <ol key={lineIdx} className="list-decimal pl-6 py-0.5">
                    <li className="text-zinc-300">
                      {renderTextWithBold(contentStr)}
                    </li>
                  </ol>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="border-l-4 border-blue-500 pl-4 py-1.5 italic my-2 bg-blue-500/5 rounded-r text-zinc-300">
                    {renderTextWithBold(trimmed.slice(2))}
                  </blockquote>
                );
              }
              
              if (trimmed === '') {
                return <div key={lineIdx} className="h-2" />;
              }

              return (
                <p key={lineIdx} className="text-zinc-300 my-0.5">
                  {renderTextWithBold(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
