import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "VidFetch",
      "hero_title": "Download Facebook, X & YouTube Videos",
      "hero_subtitle": "Fast, free, and secure video downloader for Facebook, X (Twitter), and YouTube.",
      "paste_url": "Paste Facebook, X, or YouTube video URL here...",
      "fetch_video": "Fetch Video",
      "supported_platforms": "Supported platforms: Facebook, X (Twitter), YouTube.",
      "invalid_url": "Please enter a valid URL.",
      "about": "About",
      "privacy": "Privacy Policy",
      "terms": "Terms of Service",
      "contact": "Contact",
      "quality": "Quality",
      "size": "Size",
      "download": "Download",
      "downloading": "Downloading...",
      "error_fetch": "Failed to fetch video details. Please try again.",
      "language": "Language",
      "dark_mode": "Dark Mode",
      "light_mode": "Light Mode",
      "refresh": "Refresh"
    }
  },
  ur: {
    translation: {
      "app_name": "VidFetch",
      "hero_title": "فیس بک، ایکس اور یوٹیوب ویڈیوز ڈاؤن لوڈ کریں",
      "hero_subtitle": "خاص طور پر فیس بک، ایکس (ٹویٹر) اور یوٹیوب کے لیے تیز، مفت اور محفوظ ویڈیو ڈاؤنلوڈر۔",
      "paste_url": "فیس بک، ایکس، یا یوٹیوب ویڈیو کا یو آر ایل یہاں پیسٹ کریں...",
      "fetch_video": "ویڈیو لائیں",
      "supported_platforms": "معاون پلیٹ فارمز: فیس بک، ایکس (ٹویٹر)، یوٹیوب۔",
      "invalid_url": "براہ کرم ایک درست یو آر ایل درج کریں۔",
      "about": "ہمارے بارے میں",
      "privacy": "رازداری کی پالیسی",
      "terms": "سروس کی شرائط",
      "contact": "رابطہ کریں",
      "quality": "معیار",
      "size": "سائز",
      "download": "ڈاؤن لوڈ کریں",
      "downloading": "ڈاؤن لوڈ ہو رہا ہے...",
      "error_fetch": "ویڈیو کی تفصیلات لانے میں ناکام۔ براہ کرم دوبارہ کوشش کریں۔",
      "language": "زبان",
      "dark_mode": "ڈارک موڈ",
      "light_mode": "لائٹ موڈ",
      "refresh": "تازہ کریں"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
