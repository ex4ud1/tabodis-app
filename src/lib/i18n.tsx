"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "es" | "uk" | "ru";

const DICT: Record<Lang, Record<string, string>> = {
  es: {
    "nav.inicio": "Inicio",
    "nav.propiedades": "Propiedades",
    "nav.servicios": "Servicios",
    "nav.nosotros": "Nosotros",
    "nav.testimonios": "Reseñas",
    "nav.contacto": "Contacto",
    "nav.cta": "Reservar llamada",
    "hero.cta_primary": "Ver propiedades",
    "hero.cta_secondary": "Hablar con Tatiana",
    "footer.servicios": "Servicios",
    "footer.compania": "Compañía",
    "footer.contacto": "Contacto",
    "footer.about": "Sobre nosotros",
    "footer.team": "Equipo",
    "footer.cases": "Casos",
    "footer.press": "Prensa",
    "footer.tagline":
      "Expertos en inmobiliaria, extranjería y gestión. Facilitamos tu vida en España desde 2019.",
    "common.theme_light": "Modo claro",
    "common.theme_dark": "Modo oscuro",
    "common.skip_to_content": "Saltar al contenido",
  },
  uk: {
    "nav.inicio": "Головна",
    "nav.propiedades": "Нерухомість",
    "nav.servicios": "Послуги",
    "nav.nosotros": "Про нас",
    "nav.testimonios": "Відгуки",
    "nav.contacto": "Контакти",
    "nav.cta": "Зарезервувати дзвінок",
    "hero.cta_primary": "Дивитись об'єкти",
    "hero.cta_secondary": "Поговорити з Тетяною",
    "footer.servicios": "Послуги",
    "footer.compania": "Компанія",
    "footer.contacto": "Контакти",
    "footer.about": "Про нас",
    "footer.team": "Команда",
    "footer.cases": "Кейси",
    "footer.press": "Преса",
    "footer.tagline":
      "Експерти з нерухомості, легалізації та сервісу. Спрощуємо ваше життя в Іспанії з 2019.",
    "common.theme_light": "Світла тема",
    "common.theme_dark": "Темна тема",
    "common.skip_to_content": "Перейти до контенту",
  },
  ru: {
    "nav.inicio": "Главная",
    "nav.propiedades": "Недвижимость",
    "nav.servicios": "Услуги",
    "nav.nosotros": "О нас",
    "nav.testimonios": "Отзывы",
    "nav.contacto": "Контакты",
    "nav.cta": "Заказать звонок",
    "hero.cta_primary": "Смотреть объекты",
    "hero.cta_secondary": "Поговорить с Татьяной",
    "footer.servicios": "Услуги",
    "footer.compania": "Компания",
    "footer.contacto": "Контакты",
    "footer.about": "О нас",
    "footer.team": "Команда",
    "footer.cases": "Кейсы",
    "footer.press": "Пресса",
    "footer.tagline":
      "Эксперты по недвижимости, легализации и сервису. Упрощаем вашу жизнь в Испании с 2019.",
    "common.theme_light": "Светлая тема",
    "common.theme_dark": "Тёмная тема",
    "common.skip_to_content": "Перейти к содержимому",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangCtx = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  t: (k) => DICT.es[k] ?? k,
});

const STORAGE_KEY = "tabodis_lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "es" || saved === "uk" || saved === "ru") setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === "uk" ? "uk" : l === "ru" ? "ru" : "es";
  };

  const t = (key: string) => DICT[lang][key] ?? DICT.es[key] ?? key;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
