import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DownloadCloud } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <DownloadCloud size={24} className="text-blue-600" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {t('app_name')}
              </span>
            </a>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              {t('hero_subtitle')}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} {t('app_name')}. All rights reserved.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Disclaimer: This tool is for educational purposes only. Do not download copyrighted content.
          </p>
        </div>
      </div>
    </footer>
  );
}
