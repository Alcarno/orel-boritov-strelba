# Orel Bořitov - Střelba ze vzduchovek

Webová aplikace pro dlouhodobé sledování soutěže střelby ve vzduchovkách organizace Orel Bořitov.

## Funkce

- **Registrace hráčů** - Registrace nových hráčů do kategorií (Chlapci do 15 let, Dívky do 15 let, Muži od 16 let, Ženy od 16 let)
- **Správa soutěží** - Vytváření nových soutěží (Jarní/Podzimní střelby od roku 2023)
- **Zápis výsledků** - Zápis výsledků dvou kol (každé kolo 0-50 bodů)
- **Vyhodnocení** - Automatické vyhodnocení výsledků podle kategorií a absolutní vítěz
- **Historie hráče** - Sledování historických výsledků jednotlivých hráčů
- **Statistiky** - Zobrazení maximálních výsledků v kategoriích a absolutního rekordu

## Instalace

1. Nainstalujte závislosti:
```bash
npm install
```

2. Spusťte vývojový server:
```bash
npm run dev
```

3. Aplikace bude dostupná na `http://localhost:5173`

## Build pro produkci

```bash
npm run build
```

## Technologie

- React 18
- TypeScript
- Vite
- React Router
- LocalStorage pro ukládání dat

## Poznámky

- Data se ukládají lokálně v prohlížeči (LocalStorage)
- Logo organizace lze přidat později do složky `public` a upravit v `index.html` nebo `App.css`



