# Nasazení do repository pdvorackova/orel-boritov-strelba

## Postup nasazení

### 1. Zkontroluj oprávnění
- Požádej kolegyni (pdvorackova), aby ti dala **Write** nebo **Admin** přístup k repository
- Zkontroluj v: https://github.com/pdvorackova/orel-boritov-strelba/settings/access

### 2. Naklonuj si repository
```bash
git clone https://github.com/pdvorackova/orel-boritov-strelba.git
cd orel-boritov-strelba
```

### 3. Zkopíruj všechny soubory projektu
- Zkopíruj všechny soubory z tohoto projektu do naklonovaného repo
- Ujisti se, že máš všechny soubory včetně:
  - `src/` složka
  - `public/` složka
  - `package.json`
  - `vite.config.ts`
  - `tsconfig.json`
  - `.github/workflows/deploy.yml`
  - `.gitignore`
  - atd.

### 4. Commitni a pushni změny
```bash
git add .
git commit -m "Add deployment configuration for GitHub Pages"
git push origin main
```

### 5. Požádej kolegyni o povolení GitHub Pages
Kolegyně (nebo ty s Admin oprávněním) musí:
1. Jít na: https://github.com/pdvorackova/orel-boritov-strelba/settings/pages
2. V sekci "Source" vybrat **"GitHub Actions"**
3. Uložit nastavení

### 6. Počkej na automatické nasazení
- Po pushnutí se automaticky spustí GitHub Actions workflow
- Můžeš sledovat průběh v: https://github.com/pdvorackova/orel-boritov-strelba/actions
- Build trvá obvykle 1-2 minuty

### 7. Aplikace bude dostupná na:
**https://pdvorackova.github.io/orel-boritov-strelba/**

## Důležité poznámky

- URL budou obsahovat `#` (např. `https://pdvorackova.github.io/orel-boritov-strelba/#/register-player`)
- To je normální pro GitHub Pages s HashRouter
- Po každém pushnutí do `main` se automaticky nasadí nová verze

## Pokud něco nefunguje

1. Zkontroluj, že máš write přístup k repo
2. Zkontroluj, že GitHub Pages je povolené v Settings → Pages
3. Zkontroluj logy workflow v sekci Actions
4. Pokud workflow selže, zkontroluj chybové hlášky v logu

