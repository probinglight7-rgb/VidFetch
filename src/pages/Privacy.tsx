import { useTranslation } from 'react-i18next';

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">{t('privacy')}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">Last updated: April 2026</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <p className="mb-4">
          We only collect information that is necessary to provide our services. This includes the URLs you submit for processing. We do not store the downloaded videos on our servers permanently.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="mb-4">
          The information we collect is used solely to process your requests and improve our website's performance. We may use aggregated, non-identifying data for analytics purposes.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Third-Party Services</h2>
        <p className="mb-4">
          We may use third-party services (like Google Analytics) to monitor and analyze the use of our service. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
        </p>
      </div>
    </div>
  );
}
