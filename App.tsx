
import React, { useState, useCallback, useRef } from 'react';
import { getHerbalTeaSuggestion } from './services/geminiService';

const Header: React.FC = () => (
  <header className="w-full text-center py-6">
    <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
      <span className="text-amber-600">ネムティー</span>
      <span className="text-xl md:text-2xl text-slate-600"> - 睡眠専門AIアドバイザー</span>
    </h1>
    <p className="text-slate-500 mt-2">あなたの眠りの悩みに、優しい一杯を。</p>
  </header>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
  </div>
);

interface InputFormProps {
  userInput: string;
  setUserInput: (value: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ userInput, setUserInput, handleSubmit, isLoading }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      <label htmlFor="sleep-problem" className="block text-lg font-medium text-slate-700">
        あなたの睡眠に関するお悩みを教えてください
      </label>
      <textarea
        id="sleep-problem"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="例：最近ストレスで寝つきが悪く、夜中に何度も目が覚めてしまいます..."
        className="w-full h-40 p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow duration-200 resize-none"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={isLoading || !userInput.trim()}
        className="w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? '提案を考えています...' : 'ネムティーの提案をもらう'}
      </button>
       <p className="text-center text-sm text-slate-500">Cmd/Ctrl + Enterでも送信できます</p>
    </div>
  );
};

const getBenefitColors = (benefit: string): string => {
  const normalizedBenefit = benefit.trim();
  switch (normalizedBenefit) {
    case 'リラックス':
      return 'bg-gradient-to-br from-indigo-200 to-purple-300';
    case '安眠':
      return 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900';
    case 'ストレス軽減':
      return 'bg-gradient-to-br from-emerald-200 to-teal-300';
    case '消化促進':
      return 'bg-gradient-to-br from-amber-200 to-orange-300';
    case '鎮静':
      return 'bg-gradient-to-br from-sky-200 to-cyan-300';
    default:
      return 'bg-gradient-to-br from-slate-200 to-stone-300';
  }
};


interface ResultDisplayProps {
  aiResponse: string | null;
  isLoading: boolean;
  error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ aiResponse, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  const handleTeaCardClick = (teaName: string) => {
    setSearchTerm(teaName);
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    const encodedTerm = encodeURIComponent(searchTerm.trim());
    const searchUrl = `https://www.amazon.co.jp/s?k=${encodedTerm}&i=food-beverage`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
  };

  const renderResponse = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <p className="text-red-500 text-center">{error}</p>;
    if (!aiResponse) return null;

    const sections = aiResponse.split(/(?=①|②|③|④)/).filter(s => s.trim());

    return (
      <div className="space-y-8 text-slate-800">
        {sections.map((section, index) => {
          const lines = section.trim().split('\n');
          const title = lines[0];
          const content = lines.slice(1).filter(l => l.trim() !== '');

          if (title.includes('② おすすめのハーブティー')) {
            return (
              <div key={index}>
                <h3 className="text-lg font-bold text-amber-700 mb-4 border-b-2 border-amber-200 pb-1">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content.map((line, lineIndex) => {
                    if (line.trim().startsWith('・')) {
                      const parts = line.trim().substring(1).split('｜');
                      if (parts.length === 3) {
                        const [teaName, benefit, description] = parts;
                        const backgroundClass = getBenefitColors(benefit);
                        return (
                          <div key={lineIndex} onClick={() => handleTeaCardClick(teaName.trim())} className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col cursor-pointer hover:border-amber-400">
                            <div className={`w-full h-40 ${backgroundClass}`} role="img" aria-label={`${benefit.trim()}をイメージした色のグラデーション`}></div>
                            <div className="p-4 flex-grow flex flex-col">
                              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-2 self-start">{benefit.trim()}</span>
                              <h4 className="font-bold text-lg text-slate-800 mb-1">{teaName.trim()}</h4>
                              <p className="text-slate-600 text-sm flex-grow">{description.trim()}</p>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          }
          
          return (
            <div key={index}>
              <h3 className="text-lg font-bold text-amber-700 mb-2 border-b-2 border-amber-200 pb-1">{title}</h3>
              <div className="space-y-2 pl-2">
                {content.map((line, lineIndex) => {
                    if (line.trim().startsWith('・')) {
                         const parts = line.trim().substring(1).split('：');
                         return (
                            <div key={lineIndex} className="flex">
                                <span className="text-amber-600 mr-2">●</span>
                                <div>
                                    <strong className="font-bold">{parts[0]}</strong>
                                    {parts.length > 1 && `：${parts.slice(1).join('：')}`}
                                </div>
                            </div>
                         );
                    }
                    return <p key={lineIndex}>{line}</p>
                })}
              </div>
            </div>
          );
        })}

        <div ref={searchRef} className="pt-8 mt-8 border-t border-amber-200 text-center">
          <h4 className="text-lg font-bold text-slate-700 mb-2">気になるハーブティーを探してみましょう</h4>
          <p className="text-sm text-slate-500 mb-4">
            おすすめのハーブティーカードをクリックすると、自動で入力されます。
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ハーブティー名を入力..."
              className="flex-grow p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200 w-full"
              aria-label="ハーブティー検索"
            />
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim()}
              className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              オンラインストアで探す
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full mt-8">
      {aiResponse || isLoading || error ? (
        <div className="w-full bg-amber-50/70 p-6 rounded-xl border border-amber-200 shadow-inner">
         {renderResponse()}
        </div>
      ) : null}
    </div>
  );
};


export default function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await getHerbalTeaSuggestion(userInput);
      setAiResponse(response);
    } catch (err) {
      setError('提案の取得中にエラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading]);

  return (
    <div className="bg-amber-50 min-h-screen text-slate-800 flex flex-col items-center p-4 sm:p-6">
      <main className="w-full max-w-2xl mx-auto">
        <Header />
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
          <InputForm
            userInput={userInput}
            setUserInput={setUserInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        <ResultDisplay 
          aiResponse={aiResponse}
          isLoading={isLoading}
          error={error}
        />
      </main>
      <footer className="text-center py-4 mt-8">
        <p className="text-sm text-slate-400">© 2024 Nem-Tea AI Advisor</p>
      </footer>
    </div>
  );
}
