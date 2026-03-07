-- ============================================================
-- OREL BOŘITOV - STŘELBA: Migrace databáze Supabase
-- ============================================================
-- Spusťte v Supabase Dashboard → SQL Editor
-- Skript je bezpečný pro opakované spuštění (IF NOT EXISTS / IF EXISTS)
-- ============================================================


-- ============================================================
-- ČÁST 1: MIGRACE EXISTUJÍCÍ DATABÁZE (přidání nových sloupců)
-- ============================================================

-- Tabulka competitions: nové sloupce pro uzamčení soutěže
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS locked boolean DEFAULT false;
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS password text DEFAULT null;

-- Tabulka results: nové sloupce pro rozstřel a kategorii v době soutěže
ALTER TABLE results ADD COLUMN IF NOT EXISTS rozstrel integer DEFAULT null;
ALTER TABLE results ADD COLUMN IF NOT EXISTS category_at_time text DEFAULT null;

-- Povolení NULL pro round1 a round2 (výsledky se mohou vytvářet postupně)
ALTER TABLE results ALTER COLUMN round1 DROP NOT NULL;
ALTER TABLE results ALTER COLUMN round2 DROP NOT NULL;
ALTER TABLE results ALTER COLUMN total SET DEFAULT 0;

-- Doplnění category_at_time u existujících výsledků (z aktuální kategorie hráče)
UPDATE results r
SET category_at_time = p.category
FROM players p
WHERE r.player_id = p.id
  AND r.category_at_time IS NULL;


-- ============================================================
-- ČÁST 2: KOMPLETNÍ SCHÉMA (pro vytvoření od nuly)
-- Pokud tabulky už existují, tato část se přeskočí.
-- ============================================================

-- Tabulka hráčů
CREATE TABLE IF NOT EXISTS players (
    id text PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL CHECK (category IN ('chlapci-do-15', 'divky-do-15', 'muzi-od-16', 'zeny-od-16')),
    created_at timestamptz DEFAULT now()
);

-- Tabulka soutěží
CREATE TABLE IF NOT EXISTS competitions (
    id text PRIMARY KEY,
    type text NOT NULL CHECK (type IN ('jarni', 'podzimni')),
    year integer NOT NULL,
    date text NOT NULL,
    locked boolean DEFAULT false,
    password text DEFAULT null
);

-- Tabulka výsledků
CREATE TABLE IF NOT EXISTS results (
    id text PRIMARY KEY,
    player_id text NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    competition_id text NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    round1 integer CHECK (round1 IS NULL OR (round1 >= 0 AND round1 <= 50)),
    round2 integer CHECK (round2 IS NULL OR (round2 >= 0 AND round2 <= 50)),
    rozstrel integer DEFAULT null CHECK (rozstrel IS NULL OR (rozstrel >= 0 AND rozstrel <= 50)),
    total integer DEFAULT 0,
    category_at_time text CHECK (category_at_time IN ('chlapci-do-15', 'divky-do-15', 'muzi-od-16', 'zeny-od-16')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(player_id, competition_id)
);

-- Indexy pro rychlejší dotazy
CREATE INDEX IF NOT EXISTS idx_results_competition_id ON results(competition_id);
CREATE INDEX IF NOT EXISTS idx_results_player_id ON results(player_id);
CREATE INDEX IF NOT EXISTS idx_results_category_at_time ON results(category_at_time);
CREATE INDEX IF NOT EXISTS idx_competitions_year_type ON competitions(year, type);


-- ============================================================
-- ČÁST 3: RLS (Row Level Security) – volitelné
-- Povolí čtení a zápis pro všechny (anon klíč)
-- ============================================================

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Politiky pro veřejný přístup (čtení i zápis bez autentizace)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on players') THEN
        CREATE POLICY "Allow all on players" ON players FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on competitions') THEN
        CREATE POLICY "Allow all on competitions" ON competitions FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on results') THEN
        CREATE POLICY "Allow all on results" ON results FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
