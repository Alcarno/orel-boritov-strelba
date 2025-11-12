# Dokumentace aplikace - Orel Bořitov - Střelba ze vzduchovek

## Přehled aplikace

Webová aplikace pro správu a sledování střeleckých soutěží ze vzduchovek organizace Orel Bořitov. Aplikace umožňuje registraci hráčů, správu soutěží, zadávání a zobrazení výsledků, sledování historie hráčů a generování statistik.

## Hlavní funkce

### 1. Domů
- Přehled základních statistik (počet hráčů, soutěží, výsledků)
- Rychlé odkazy na hlavní sekce
- Sekce pro uzamčení/odemknutí soutěží

### 2. Registrovat hráče
- Registrace nových hráčů do kategorií
- Automatická kontrola duplicitních jmen
- Možnost převodu existujícího hráče do nové kategorie (pouze z nižší do vyšší)
- Automatické vytvoření výsledku pro vybranou soutěž

### 3. Vytvořit novou soutěž
- Vytváření nových soutěží (Jarní/Podzimní střelby)
- Nastavení roku, typu a data soutěže

### 4. Zadat výsledky
- Zadávání výsledků pro jednotlivé kola (0-50 bodů)
- Možnost zadat každé kolo zvlášť
- Automatické zobrazení pole pro rozstřel při shodě bodů na 1-3 místě
- Validace: nelze zadat výsledky pro uzamčenou soutěž

### 5. Výsledky soutěží
- Zobrazení výsledků podle kategorií
- Zobrazení absolutního vítěze
- Filtrování podle soutěže a kategorie
- Generování PDF výsledkové listiny
- **Poznámka**: V této sekci nelze opravovat výsledky (pouze zobrazení)

### 6. Historie hráče
- Zobrazení všech výsledků hráče napříč soutěžemi
- Zobrazení kategorie, ve které hráč v dané soutěži startoval
- Označení změny kategorie
- Průměrný a nejlepší výsledek
- Řazení od nejnovější po nejstarší

### 7. Statistiky
- Celkové statistiky (počet hráčů, soutěží, výsledků)
- Absolutní rekord (nejvyšší počet bodů)
- Absolutní vítězové podle soutěží
- Maximální výsledky podle kategorií
- Počet hráčů podle soutěží (s počtem hráčů v každé kategorii)
- Vítězové v každé kategorii podle soutěží
- Řazení soutěží od nejnovější po nejstarší

### 8. Správa
- **Správa hráčů**:
  - Zobrazení všech hráčů nebo hráčů v konkrétní soutěži
  - Filtrování podle kategorie
  - Změna kategorie hráče (pouze z nižší do vyšší)
  - Smazání hráče ze soutěže
  - Smazání hráče úplně
- **Správa výsledků**:
  - Zobrazení a oprava výsledků
  - Filtrování podle soutěže a kategorie
- **Správa soutěží**:
  - Zobrazení všech soutěží
  - Uzamčení/odemknutí soutěží

## Pravidla a omezení

### Kategorie hráčů
- **Chlapci do 15 let** - může přejít do "Muži od 16 let"
- **Dívky do 15 let** - může přejít do "Ženy od 16 let"
- **Muži od 16 let** - nelze převést zpět
- **Ženy od 16 let** - nelze převést zpět

**Přechod mezi kategoriemi:**
- ✅ Povoleno: Chlapci do 15 let → Muži od 16 let
- ✅ Povoleno: Dívky do 15 let → Ženy od 16 let
- ❌ Zakázáno: Muži od 16 let → Chlapci do 15 let
- ❌ Zakázáno: Ženy od 16 let → Dívky do 15 let
- ❌ Zakázáno: Jakékoli převody napříč (chlapci ↔ dívky, muži ↔ ženy)

### Bodování
- **Kolo 1**: 0-50 bodů
- **Kolo 2**: 0-50 bodů
- **Celkem**: Kolo 1 + Kolo 2 (rozstřel se NEPŘIČÍTÁ)
- **Rozstřel**: 0-50 bodů, používá se pouze pro určení pořadí při shodě celkových bodů

### Rozstřel (tie-breaker)
- **Rozstřel v kategorii**: Zobrazí se automaticky, pokud:
  - Hráč má stejný celkový počet bodů (bez rozstřelu) jako jiný hráč na 1., 2. nebo 3. místě ve své kategorii
  - A existují alespoň 2 hráči se stejným počtem bodů
- **Rozstřel o absolutního vítěze**: Zobrazí se automaticky, pokud:
  - Hráč je na 1. místě ve své kategorii (po určení pořadí v kategorii pomocí rozstřelu v kategorii)
  - A má stejný celkový počet bodů (bez rozstřelu) jako vítězové z jiných kategorií
  - A existují alespoň 2 vítězové kategorií se stejným počtem bodů
- Rozstřel se zadává pouze v sekci "Zadat výsledky"
- Rozstřel lze opravit v sekci "Správa" (pokud byl zadán)
- Rozstřel se nepřičítá k celkovému počtu bodů, slouží pouze pro řazení

### Řazení výsledků
- **V rámci kategorie**:
  - **Pozice 1-3**: Individuální umístění, při shodě bodů se řadí podle rozstřelu v kategorii (vyšší rozstřel = lepší pozice)
  - **Pozice 4+**: 
    - Při shodě celkových bodů se řadí podle rozstřelu v kategorii (vyšší rozstřel = lepší pozice)
    - Při shodě celkových bodů i rozstřelu se řadí abecedně podle příjmení (ignoruje se text za čárkou, např. "ml.", "st.")
    - Zobrazuje se sdílené umístění (např. "6.-7.")
- **Absolutní vítěz**:
  - Určuje se mezi vítězi kategorií (1. místo v každé kategorii)
  - Při shodě celkových bodů (bez rozstřelu) se řadí podle rozstřelu o absolutního vítěze (vyšší rozstřel = lepší pozice)
  - Rozstřel o absolutního vítěze se zadává pouze pro vítěze kategorií se stejným počtem bodů

### Uzamčení soutěží
- Soutěž lze uzamknout po zadání a vyhodnocení výsledků
- Uzamčená soutěž vyžaduje heslo pro změnu výsledků
- Uzamčenou soutěž lze odemknout zadáním správného hesla
- Po uzamčení nelze měnit výsledky bez hesla

### Historie výsledků
- Každý výsledek má uloženou kategorii z doby soutěže (`categoryAtTime`)
- Při přechodu hráče do nové kategorie se staré výsledky zachovávají v původní kategorii
- Nové výsledky se ukládají s novou kategorií hráče

### Duplicitní jména
- Nelze registrovat dva hráče se stejným jménem v téže kategorii
- Pokud existuje hráč se stejným jménem v jiné kategorii, nabídne se převod (pouze pokud je povolený)

## Technické detaily

### Ukládání dat
- Všechna data se ukládají v localStorage prohlížeče
- Klíče: `orel_boritov_players`, `orel_boritov_competitions`, `orel_boritov_results`

### Struktura dat
- **Hráč**: id, name, category, createdAt
- **Soutěž**: id, year, type (jarni/podzimni), date, locked, password, absoluteWinnerRozstrel (objekt s playerId: rozstrel hodnota)
- **Výsledek**: id, playerId, competitionId, round1, round2, rozstrel, total, categoryAtTime, createdAt

### PDF export
- Generování PDF výsledkové listiny
- Tabulky se nepřerušují přes stránky (celá tabulka se přesune na další stránku)
- Zobrazení absolutního vítěze
- Zobrazení výsledků podle kategorií

## Procesní mapa

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPUŠTĚNÍ APLIKACE                            │
│                    (Načtení dat z localStorage)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   DOMŮ         │
                    │  (Přehled)     │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│ REGISTRACE    │   │ VYTVOŘIT     │   │ ZADAT        │
│ HRÁČE         │   │ SOUTĚŽ       │   │ VÝSLEDKY     │
└───────┬───────┘   └──────┬───────┘   └──────┬───────┘
        │                  │                  │
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│  KONTROLA: Duplicitní jméno?                        │
│  - ANO → Nabídnout převod (pouze povolený)         │
│  - NE → Vytvořit nového hráče                       │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  VYTVOŘENÍ VÝSLEDKU                                  │
│  (round1=null, round2=null, total=0)                │
└─────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  ZADÁVÁNÍ VÝSLEDKŮ                                  │
│  - Kolo 1 (0-50)                                    │
│  - Kolo 2 (0-50)                                    │
│  - Rozstřel? (pouze pokud shoda na 1-3 místě)       │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  VÝPOČET CELKU                                      │
│  total = round1 + round2 (BEZ rozstřelu)            │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  KONTROLA: Potřebný rozstřel?                       │
│  (shoda na 1-3 místě ve stejné kategorii)            │
│  - ANO → Zobrazit pole pro rozstřel                 │
│  - NE → Hotovo                                      │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  VÝPOČET POŘADÍ                                     │
│  1. Seřadit podle total (sestupně)                   │
│  2. Při shodě: seřadit podle rozstřelu (sestupně)   │
│  3. Při shodě total i rozstřelu (od 4. místa):       │
│     seřadit abecedně podle příjmení                  │
│  4. Přiřadit umístění (sdílené od 4. místa)          │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  ZOBRAZENÍ VÝSLEDKŮ                                 │
│  - Podle kategorií                                  │
│  - Absolutní vítěz                                  │
│  - PDF export                                       │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  UZAMČENÍ SOUTĚŽE?                                  │
│  - ANO → Vyžadovat heslo pro změny                 │
│  - NE → Volná úprava                                │
└─────────────────────────────────────────────────────┘
```

## Detailní procesy

### Proces 1: Registrace hráče
```
1. Vyplnit jméno hráče
2. Vybrat kategorii
3. Vybrat soutěž
4. Odeslat formulář
   ├─ Kontrola duplicitního jména
   │  ├─ Stejná kategorie → CHYBA
   │  └─ Jiná kategorie → Nabídnout převod
   │     ├─ Povolený převod → Převést hráče
   │     └─ Nepovolený převod → CHYBA
   └─ Vytvořit nového hráče
      └─ Vytvořit výsledek pro soutěž
```

### Proces 2: Zadávání výsledků
```
1. Vybrat soutěž
2. Vybrat kategorii (volitelné)
3. Vybrat hráče
4. Zadat Kolo 1 (0-50)
5. Zadat Kolo 2 (0-50)
   ├─ Kontrola: Shoda na 1-3 místě?
   │  └─ ANO → Zobrazit pole pro rozstřel
   └─ Zadat rozstřel (pokud potřeba)
6. Uložit výsledky
   └─ Přepočítat pořadí
```

### Proces 3: Přechod hráče mezi kategoriemi
```
1. Vybrat hráče v sekci Správa
2. Kliknout "Změnit kategorii"
   ├─ Kontrola: Povolený převod?
   │  ├─ ANO → Potvrdit převod
   │  │  └─ Aktualizovat kategorii hráče
   │  │     └─ Staré výsledky zachovat categoryAtTime
   │  └─ NE → Zobrazit chybu
```

### Proces 4: Uzamčení soutěže
```
1. Vybrat soutěž v sekci Domů
2. Kliknout "Uzamknout"
3. Zadat heslo
4. Potvrdit
   └─ Soutěž je uzamčená
      └─ Změny výsledků vyžadují heslo
```

## Datové toky

### Tok při registraci hráče
```
Formulář → Kontrola duplicit → Storage.players.add() → Storage.results.add()
```

### Tok při zadávání výsledků
```
Formulář → Validace → Storage.results.update() → calculateResults() → Zobrazení
```

### Tok při přechodu kategorie
```
changePlayerCategory() → Storage.players.update() → Aktualizace seznamů
```

## Bezpečnost a validace

- **Uzamčené soutěže**: Nelze měnit výsledky bez hesla
- **Validace bodů**: 0-50 bodů pro každé kolo a rozstřel
- **Duplicitní jména**: Kontrola při registraci
- **Přechod kategorií**: Pouze povolené převody
- **Kategorie v historii**: Zachování původní kategorie z doby soutěže

