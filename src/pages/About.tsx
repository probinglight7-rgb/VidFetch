import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">{t('about')}</h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-4">
          Welcome to {t('app_name')}, your number one source for downloading videos from across the web. We're dedicated to providing you the very best of video downloading services, with an emphasis on speed, security, and ease of use.
        </p>
        <p className="mb-4">
          Founded in 2026, {t('app_name')} has come a long way from its beginnings. When we first started out, our passion for making media accessible drove us to start our own business.
        </p>
        <p className="mb-4">
          We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
        </p>
      </div>
    </div>
  );
}
