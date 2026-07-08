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
        return <strong key={i} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 text-sm sm:text-base text-slate-800 leading-relaxed text-left">
      {parts.map((part, index) => {
        // If it's a code block
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.split(/\r?\n/);
          const firstLine = lines[0].replace('```', '').trim();
          const language = firstLine || 'code';
          const code = lines.slice(1, -1).join('\n');

          return (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-mono text-slate-500">
                <span className="uppercase font-bold">{language}</span>
                <button
                  onClick={() => copyToClipboard(code, index)}
                  className="flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#01cb65]" />
                      <span className="text-[#01cb65] font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-slate-800 bg-slate-50 leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // If it's regular text, parse line-by-line for basic markdown elements
        const lines = part.split(/\r?\n/);
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-lg font-extrabold text-slate-950 pt-4 pb-1">
                    {renderTextWithBold(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4 key={lineIdx} className="text-base font-bold text-slate-950 pt-2 pb-0.5">
                    {renderTextWithBold(trimmed.slice(5))}
                  </h4>
                );
              }
              if (trimmed.startsWith('* ')) {
                return (
                  <ul key={lineIdx} className="list-disc pl-6 py-0.5">
                    <li className="text-slate-700">
                      {renderTextWithBold(trimmed.slice(2))}
                    </li>
                  </ul>
                );
              }
              if (trimmed.startsWith('1. ') || /^\d+\.\s/.test(trimmed)) {
                const contentStr = trimmed.replace(/^\d+\.\s/, '');
                return (
                  <ol key={lineIdx} className="list-decimal pl-6 py-0.5">
                    <li className="text-slate-700">
                      {renderTextWithBold(contentStr)}
                    </li>
                  </ol>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="border-l-4 border-[#01cb65] pl-4 py-1.5 italic my-2 bg-emerald-500/5 rounded-r text-slate-750 font-medium">
                    {renderTextWithBold(trimmed.slice(2))}
                  </blockquote>
                );
              }
              
              if (trimmed === '') {
                return <div key={lineIdx} className="h-2" />;
              }

              return (
                <p key={lineIdx} className="text-slate-700 my-0.5">
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
