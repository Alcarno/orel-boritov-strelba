# Integrace Supabase - Postup

## Co je Supabase?
- Open-source alternativa k Firebase
- PostgreSQL databáze v cloudu
- Zdarma tier: 500 MB databáze, 2 GB bandwidth, 50k měsíčních aktivních uživatelů
- REST API a Realtime subscriptions
- Snadná integrace s React

## Postup integrace

### 1. Vytvoření Supabase účtu a projektu

1. **Zaregistruj se na:** https://supabase.com
2. **Vytvoř nový projekt:**
   - Klikni "New Project"
   - Vyplň:
     - **Name:** orel-boritov-strelba (nebo jiný název)
     - **Database Password:** (vytvoř silné heslo, ulož si ho!)
     - **Region:** vyber nejbližší (např. West Europe)
   - Klikni "Create new project"
   - Počkej 1-2 minuty na vytvoření projektu

### 2. Vytvoření tabulek v databázi

1. **V Supabase dashboardu jdi do:** SQL Editor (v levém menu)
2. **Spusť tento SQL kód:**

```sql
-- Tabulka pro hráče
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('chlapci-do-15', 'divky-do-15', 'muzi-od-16', 'zeny-od-16')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabulka pro soutěže
CREATE TABLE competitions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('jarni', 'podzimni')),
  year INTEGER NOT NULL,
  date DATE NOT NULL,
  locked BOOLEAN DEFAULT FALSE,
  password TEXT,
  absolute_winner_rozstrel JSONB
);

-- Tabulka pro výsledky
CREATE TABLE results (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  round1 INTEGER NOT NULL CHECK (round1 >= 0 AND round1 <= 50),
  round2 INTEGER NOT NULL CHECK (round2 >= 0 AND round2 <= 50),
  rozstrel INTEGER CHECK (rozstrel >= 0 AND rozstrel <= 50),
  total INTEGER NOT NULL,
  category_at_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy pro rychlejší dotazy
CREATE INDEX idx_results_player_id ON results(player_id);
CREATE INDEX idx_results_competition_id ON results(competition_id);
CREATE INDEX idx_results_category_at_time ON results(category_at_time);

-- Povolení veřejného přístupu (pro read/write)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Politika pro veřejný přístup (pro jednoduchost - v produkci by měla být autentizace)
CREATE POLICY "Enable all access for all users" ON players FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON competitions FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON results FOR ALL USING (true);
```

3. **Klikni "Run"** a zkontroluj, že se tabulky vytvořily

### 3. Získání API klíčů

1. **V Supabase dashboardu jdi do:** Settings → API
2. **Zkopíruj si:**
   - **Project URL** (např. `https://xxxxx.supabase.co`)
   - **anon/public key** (začíná `eyJ...`)

### 4. Instalace Supabase klienta

```bash
npm install @supabase/supabase-js
```

### 5. Vytvoření Supabase klienta

Vytvoř soubor `src/utils/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 6. Vytvoření .env souboru

Vytvoř soubor `.env` v root projektu:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**DŮLEŽITÉ:** Přidej `.env` do `.gitignore` (aby se klíče nedostaly do gitu)

### 7. Úprava storage.ts

Místo localStorage použijeme Supabase API. Bude potřeba přepsat všechny metody v `storage.ts`.

### 8. Přidání env variables do GitHub Actions

V GitHub repository:
1. Settings → Secrets and variables → Actions
2. Přidej:
   - `VITE_SUPABASE_URL` = URL z Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key z Supabase

A uprav workflow, aby používal tyto proměnné.

## Výhody Supabase

✅ **Zdarma** pro malé projekty
✅ **Sdílená databáze** - všichni uživatelé vidí stejná data
✅ **Realtime** - změny se synchronizují automaticky
✅ **Bezpečnost** - Row Level Security
✅ **Snadná migrace** - můžeme exportovat/importovat data

## Nevýhody

⚠️ Vyžaduje internetové připojení
⚠️ Potřebuje API klíče (ale jsou veřejné, takže OK)
⚠️ O něco složitější než localStorage

## Odhadovaný čas

- Vytvoření Supabase projektu: 5 minut
- Vytvoření tabulek: 5 minut
- Instalace a konfigurace: 10 minut
- Přepsání storage.ts: 30-60 minut
- Testování: 15 minut

**Celkem: cca 1-2 hodiny**

---

Chceš, abych ti pomohl s implementací? Můžu:
1. Přepsat `storage.ts` pro Supabase
2. Vytvořit potřebné soubory
3. Upravit GitHub Actions workflow
4. Přidat fallback na localStorage (pro offline režim)


