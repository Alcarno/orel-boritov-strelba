# ⚠️ DŮLEŽITÉ: Povolení GitHub Pages

## Problém
Workflow selhává s chybou: `Get Pages site failed. Please verify that the repository has Pages enabled`

## Řešení

**Kolegyně (pdvorackova) nebo někdo s Admin oprávněním musí povolit GitHub Pages:**

### Postup:

1. **Jdi na:** https://github.com/pdvorackova/orel-boritov-strelba/settings/pages

2. **V sekci "Source":**
   - Vyber **"GitHub Actions"** (ne "Deploy from a branch")
   - Klikni **"Save"**

3. **Po uložení:**
   - GitHub automaticky vytvoří potřebné prostředí pro Pages
   - Workflow se pak bude moci úspěšně nasadit

### Alternativně (pokud máš Admin oprávnění):

Pokud máš Admin přístup k repo, můžeš to udělat sám:
1. Jdi do Settings → Pages
2. Vyber "GitHub Actions" jako Source
3. Ulož

### Po povolení:

- Workflow se automaticky znovu spustí (nebo ho můžeš spustit ručně v sekci Actions)
- Aplikace bude dostupná na: **https://pdvorackova.github.io/orel-boritov-strelba/**

## Kontrola

Zkontroluj, že je to povolené:
- Settings → Pages → Source by mělo být nastaveno na "GitHub Actions"
- V sekci Actions by měl být vidět workflow run


