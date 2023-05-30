import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import zh from "./zh.json";

const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng:"en", //// 默认语言
  fallbackLng: "en", // 如果找不到当前语言的翻译文本，将使用该语言作为回退
  interpolation: {
    escapeValue: false, // 不需要对翻译文本进行转义
  },
});
