# Nasazení na GitHub Pages

## Postup nasazení

### Varianta A: Vlastní repository

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

### Varianta B: Nasazení do cizího repository (kolega/kolegyně)

1. **Zkontrolujte, že máte write přístup k repository**
   - Vlastník repo musí vám dát "Write" nebo "Admin" oprávnění
   - Zkontrolujte v Settings → Collaborators nebo přes organizaci

2. **Nahrajte kód do repository**
   ```bash
   git clone https://github.com/COLEGYNE_USERNAME/NAZEV_REPO.git
   cd NAZEV_REPO
   # Zkopírujte soubory projektu sem
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

3. **Povolte GitHub Pages (vlastník repo nebo vy s Admin oprávněním)**
   - Přejděte do Settings → Pages
   - V sekci "Source" vyberte "GitHub Actions"
   - Uložte nastavení
   - **Poznámka**: Pokud nemáte Admin oprávnění, požádejte vlastníka repo, aby to udělal

4. **Po pushnutí kódu se automaticky spustí workflow**
   - GitHub Actions automaticky zbuildí a nasadí aplikaci
   - Aplikace bude dostupná na: `https://COLEGYNE_USERNAME.github.io/NAZEV_REPO/`

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
4. **Pro cizí repo**: Zkontrolujte, že máte write přístup a že vlastník povolil GitHub Pages
5. Pokud workflow selže, zkontrolujte logy v sekci "Actions" → vyberte workflow run → zobrazte detaily

## Důležité pro nasazení do cizího repo

- **Oprávnění**: Musíte mít minimálně "Write" přístup k repository
- **GitHub Pages**: Vlastník repo (nebo vy s Admin oprávněním) musí povolit GitHub Pages v Settings
- **Workflow**: Workflow se spustí automaticky po pushnutí, ale potřebuje oprávnění k nasazení
- Pokud nemáte Admin oprávnění, požádejte vlastníka repo, aby:
  1. Povolil GitHub Pages v Settings → Pages → Source: "GitHub Actions"
  2. Zkontroloval, že workflow má správná oprávnění (obvykle automaticky)

