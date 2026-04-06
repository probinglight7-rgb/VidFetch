import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, Download, AlertCircle, FileVideo, Clock, HardDrive, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoFormat {
  quality: string;
  size: string;
  format: string;
  url: string;
  directUrl?: string;
}

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
  formats: VideoFormat[];
}

export default function Home() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  // Auto-detect clipboard URL
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          // Only auto-fill if empty
          if (!url) {
            setUrl(text);
          }
        }
      } catch (err) {
        // Ignore clipboard errors (permissions, etc.)
      }
    };
    
    // Only run on focus to avoid annoying prompts immediately
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, [url]);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      setError(t('invalid_url'));
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoData(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setVideoData(data);
    } catch (err: any) {
      setError(err.message || t('error_fetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setUrl('');
    setVideoData(null);
    setError('');
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-3xl z-10 space-y-12">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            {t('hero_title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            {t('hero_subtitle')}
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleFetch} 
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex flex-col md:flex-row items-center bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 gap-2">
            <div className="flex-grow flex items-center w-full px-4">
              <Search className="text-gray-400 mr-3" size={24} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('paste_url')}
                className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
              {t('fetch_video')}
            </button>
          </div>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('supported_platforms')}
          </p>
          {(url || videoData || error) && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              {t('refresh')}
            </button>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}

          {videoData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail Section */}
                <div className="md:w-2/5 relative bg-black">
                  <img 
                    src={videoData.thumbnail} 
                    alt={videoData.title} 
                    className="w-full h-full object-cover aspect-video md:aspect-auto"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Clock size={12} />
                    {videoData.duration}
                  </div>
                </div>

                {/* Details & Formats Section */}
                <div className="md:w-3/5 p-6 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 line-clamp-2" title={videoData.title}>
                    {videoData.title}
                  </h2>

                  <div className="space-y-3 flex-grow">
                    {videoData.formats.map((format, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-2 rounded-lg">
                            <FileVideo size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{format.quality}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="uppercase">{format.format}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><HardDrive size={10}/> {format.size}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 items-end">
                          <a 
                            href={format.directUrl || format.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                          >
                            <Download size={16} />
                            <span className="hidden sm:inline">{t('download')}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
