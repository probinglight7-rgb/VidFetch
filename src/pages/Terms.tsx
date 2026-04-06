import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">{t('terms')}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="mb-4">Last updated: April 2026</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using {t('app_name')}, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily download one copy of the materials (information or software) on {t('app_name')} for personal, non-commercial transitory viewing only.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Copyright and Fair Use</h2>
        <p className="mb-4">
          Users are solely responsible for ensuring they have the right to download any content using our service. We do not endorse or support the downloading of copyrighted material without permission from the copyright holder.
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Disclaimer</h2>
        <p className="mb-4">
          The materials on {t('app_name')} are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
      </div>
    </div>
  );
}
