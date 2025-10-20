import React, { useState, useEffect } from 'react';
import { logService } from '../services/logService';
import type { LogEntry, LogLevel } from '../types';

const LOG_LEVELS: LogLevel[] = ['API', 'INFO', 'DEBUG', 'WARN', 'ERROR'];

const LEVEL_COLORS: Record<LogLevel, string> = {
  API: 'border-purple-500',
  INFO: 'border-cyan-500',
  DEBUG: 'border-gray-500',
  WARN: 'border-yellow-500',
  ERROR: 'border-red-500',
};

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const LogItem: React.FC<{ entry: LogEntry }> = ({ entry }) => {
    const [isCopied, setIsCopied] = useState(false);
    const detailsString = JSON.stringify(entry.details, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(detailsString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className={`p-2 border-l-4 ${LEVEL_COLORS[entry.level]} bg-gray-800/50 my-2 rounded`}>
            <details>
                <summary className="cursor-pointer select-none">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <span className="font-mono text-xs text-gray-400">{entry.timestamp.toLocaleTimeString()}</span>
                           <span className="font-medium text-gray-200">{entry.title}</span>
                        </div>
                        <button onClick={handleCopy} className="text-xs bg-gray-600 hover:bg-gray-500 text-gray-300 px-2 py-1 rounded">
                            {isCopied ? 'Copied!' : <CopyIcon />}
                        </button>
                    </div>
                </summary>
                <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded-b-md mt-2 overflow-x-auto">
                    <code>
                        {detailsString}
                    </code>
                </pre>
            </details>
        </div>
    );
};


interface ConsoleLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsoleLogDialog: React.FC<ConsoleLogDialogProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>(logService.getLogs());
  const [activeTab, setActiveTab] = useState<LogLevel>('API');

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = logService.subscribe(() => {
        setLogs([...logService.getLogs()]);
      });
      return unsubscribe;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => log.level === activeTab).reverse();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-[90vw] h-[90vh] flex flex-col p-6 font-mono">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold font-orbitron">Console Log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="flex border-b border-gray-700">
          {LOG_LEVELS.map(level => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === level
                  ? 'border-b-2 border-cyan-500 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {level} ({logs.filter(l => l.level === level).length})
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(entry => <LogItem key={entry.id} entry={entry} />)
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No logs for this level.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsoleLogDialog;
