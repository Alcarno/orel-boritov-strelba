# Nasazení na GitHub Pages

## Postup nasazení

1. **Vytvořte GitHub repository** (pokud ještě nemáte)
   - Přejděte na GitHub a vytvořte nový repository
   - Název může být například `orel-boritov-strelba`

2. **Nahrajte kód na GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VASE_USERNAME/orel-boritov-strelba.git
   git push -u origin main
   ```

3. **Povolte GitHub Pages v nastavení repository**
   - Přejděte do Settings → Pages
   - V sekci "Source" vyberte "GitHub Actions"
   - Uložte nastavení

4. **Po pushnutí kódu se automaticky spustí workflow**
   - GitHub Actions automaticky zbuildí a nasadí aplikaci
   - Aplikace bude dostupná na: `https://VASE_USERNAME.github.io/orel-boritov-strelba/`

## Důležité poznámky

- Aplikace používá **HashRouter** místo BrowserRouter, takže URL budou vypadat jako:
  - `https://username.github.io/repo/#/` místo `https://username.github.io/repo/`
  - To je nutné, protože GitHub Pages nepodporuje server-side routing

- Po každém pushnutí do branch `main` se automaticky spustí build a nasazení

- Build trvá obvykle 1-2 minuty

## Lokální testování

Před nasazením můžete otestovat build lokálně:
```bash
npm run build
npm run preview
```

## Řešení problémů

Pokud se aplikace nenasazuje:
1. Zkontrolujte, že workflow běží v sekci "Actions"
2. Zkontrolujte, že máte povolené GitHub Pages v Settings → Pages
3. Zkontrolujte, že workflow má správná oprávnění

