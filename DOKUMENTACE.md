# Orel Bořitov – Střelba ze vzduchovek
# Uživatelská dokumentace

---

## 1. Úvod

Aplikace slouží ke správě soutěží ve střelbě ze vzduchovek pro organizaci Orel Bořitov. Umožňuje registrovat hráče, zakládat soutěže, zadávat výsledky, prohlížet výsledkové listiny, exportovat je do PDF a spravovat celý systém.

**Adresa aplikace:** https://alcarno.github.io/orel-boritov-strelba/

Aplikace funguje v prohlížeči na počítači i na mobilu. Data se ukládají do cloudové databáze (Supabase).

---

## 2. Navigace

Horní lišta obsahuje logo a název aplikace – kliknutím na ně se vždy vrátíte na domovskou stránku. Pod tím jsou odkazy na jednotlivé sekce:

| Odkaz              | Co tam najdete                                  |
|--------------------|-------------------------------------------------|
| Domů               | Přehled a rychlé akce                           |
| Registrovat hráče  | Přidání nového hráče do systému                 |
| Nová soutěž        | Vytvoření nové soutěže (jarní/podzimní)         |
| Zadat výsledky     | Zadání bodů hráčům v konkrétní soutěži          |
| Výsledky           | Zobrazení výsledkových listin + export do PDF   |
| Historie hráče     | Přehled všech výsledků jednoho hráče            |
| Statistiky         | Rekordy, počty hráčů, zajímavosti               |
| Správa             | Mazání, zamykání, přechody kategorií (admin)     |

---

## 3. Kategorie hráčů

Systém rozlišuje 4 věkové kategorie:

| Kategorie              | Kdo sem patří        |
|------------------------|----------------------|
| Chlapci do 14,99 let   | Chlapci mladší 15 let|
| Dívky do 14,99 let     | Dívky mladší 15 let  |
| Muži od 15 let         | Muži 15 let a starší |
| Ženy od 15 let         | Ženy 15 let a starší |

Kategorii vybírá uživatel při registraci. Pokud hráč dosáhne 15 let, lze ho převést do dospělé kategorie (viz sekce Správa).

---

## 4. Registrace hráče

1. Přejděte na **Registrovat hráče**.
2. Zadejte **jméno hráče**.
3. Vyberte **kategorii**.
4. Klikněte **Registrovat hráče**.

### Co se děje automaticky:
- **Našeptávač:** Jakmile napíšete alespoň 2 znaky, systém zobrazí podobná jména již registrovaných hráčů jako varování.
- **Kontrola duplicit:** Pokud hráč se stejným jménem už existuje:
  - Ve stejné kategorii → chyba, nelze registrovat znovu.
  - V mládežnické kategorii a registrujete ho do dospělé → systém nabídne převod (např. Chlapci → Muži).
  - V jiné nepovolené kombinaci → chyba.

Po úspěšné registraci zůstáváte na stránce a můžete ihned registrovat dalšího hráče. Zelená hláška o úspěchu zmizí až při další akci.

---

## 5. Vytvoření soutěže

1. Přejděte na **Nová soutěž**.
2. Vyberte **typ** (Jarní střelby / Podzimní střelby).
3. Zadejte **rok** a **datum konání**.
4. Klikněte **Vytvořit soutěž**.

Nová soutěž je ve výchozím stavu **odemčená** (lze do ní zadávat a měnit výsledky).

---

## 6. Zadávání výsledků

1. Přejděte na **Zadat výsledky**.
2. Vyberte **soutěž** z rozbalovacího seznamu.
3. Volitelně vyberte **filtr kategorie** (zobrazí jen hráče dané kategorie).
4. Vyberte **hráče**.
5. Zadejte body:
   - **Kolo 1** (0–50 bodů) – nepovinné
   - **Kolo 2** (0–50 bodů) – nepovinné
   - **Rozstřel** (0–50 bodů) – zobrazí se automaticky, jen pokud je potřeba (viz níže)
6. Klikněte **Zadat výsledek**.

### Bodování:
- **Celkem = Kolo 1 + Kolo 2** (rozstřel se do celku nepočítá)
- Stačí zadat alespoň jednu hodnotu (např. jen rozstřel)
- Pokud hráč už má výsledek v dané soutěži, zadané hodnoty se aktualizují

### Kdy se zobrazí rozstřel:
Pole pro rozstřel se zobrazí automaticky, pokud na základě právě zadávaných bodů vznikne shoda na 1.–2. nebo 2.–3. místě v kategorii.

### Uzamčená soutěž:
Pokud je soutěž uzamčená (🔒), systém vás požádá o heslo. Bez správného hesla nelze výsledky měnit.

---

## 7. Výsledky soutěží

1. Přejděte na **Výsledky**.
2. Vyberte **soutěž**.
3. Volitelně vyberte **filtr kategorie**.

### Co vidíte:
- **Absolutní vítěz** – hráč s nejvyšším skóre ze všech vítězů kategorií (žlutý banner nahoře).
- **Tabulky kategorií** – na velkém displeji vedle sebe, na mobilu pod sebou.
- Každá tabulka obsahuje: umístění, jméno, Kolo 1, Kolo 2, Celkem, případně Rozstřel.
- Medaile: 🥇 1. místo, 🥈 2. místo, 🥉 3. místo.

### Rozstřel mezi kategoriemi (poolový):
Pokud mají hráči z různých kategorií v rámci jednoho poolu (Dospělí = Muži + Ženy, Mládež = Chlapci + Dívky) stejný počet bodů na prvních 3 místech, zobrazí se žlutý formulář pro zadání rozstřelu. Po zadání a uložení se pořadí přepočítá.

### Export do PDF:
Klikněte na tlačítko **📄 Export PDF**. Stáhne se PDF soubor s výsledky (kategorie pod sebou, větší písmo pro tisk).

---

## 8. Historie hráče

1. Přejděte na **Historie hráče**.
2. Vyberte **hráče** ze seznamu.

### Co vidíte:
- Tabulka všech soutěží, kterých se hráč zúčastnil (od nejnovější).
- Sloupce: soutěž, rok, kategorie (v jaké kategorii tehdy hrál), Kolo 1, Kolo 2, Celkem, Umístění.
- Souhrn pod tabulkou:
  - **Průměrný výsledek** (ze všech soutěží)
  - **Nejlepší výsledek** (nejvyšší celkové body)
  - **Nejlepší umístění** (např. „1. místo")

---

## 9. Statistiky

Na stránce **Statistiky** najdete:

1. **Přehledové karty:** celkový počet hráčů, soutěží a výsledků.
2. **Počet hráčů podle soutěží:** tabulka s rozpisem po kategoriích pro každou soutěž.
3. **Maximální výsledky podle kategorií:** nejlepší hráč v každé kategorii napříč všemi soutěžemi.
4. **Absolutní rekord:** nejlepší výsledek ze všech hráčů a soutěží (zlatý banner).

---

## 10. Správa (administrace)

Stránka **Správa** je rozdělena na dvě části:

### 10.1 Správa hráčů a výsledků

#### Smazat hráče
- Vyberte hráče → klikněte **Smazat hráče**.
- Smaže hráče a **všechny jeho výsledky** ze všech soutěží.
- **Nelze smazat**, pokud má hráč výsledky v uzamčené soutěži. Nejprve soutěž odemkněte.

#### Smazat výsledek hráče
- Vyberte hráče a soutěž → klikněte **Smazat výsledek**.
- Smaže pouze výsledek daného hráče v dané soutěži.
- **Nelze smazat** u uzamčené soutěže.

#### Přechod mezi kategoriemi
- Vyberte hráče → systém zobrazí možnost převodu.
- Povolené převody:
  - Chlapci do 14,99 let → Muži od 15 let
  - Dívky do 14,99 let → Ženy od 15 let
- Zpětný převod není možný.
- Historické výsledky zůstanou pod původní kategorií.

### 10.2 Správa soutěží

#### Smazat soutěž
- Vyberte soutěž → klikněte **Smazat soutěž**.
- Smaže soutěž a **všechny její výsledky**.
- **Nelze smazat** uzamčenou soutěž – nejprve ji odemkněte.

#### Uzamčení / odemčení soutěže
- **Uzamknout:** Vyberte odemčenou soutěž → zadejte heslo → klikněte **🔒 Uzamknout soutěž**.
- **Odemknout:** Vyberte uzamčenou soutěž → zadejte heslo (nebo master heslo) → klikněte **🔓 Odemknout soutěž**.

### Co zamčení znamená:
Uzamčenou soutěž **nelze**:
- Smazat
- Upravovat výsledky (bez hesla)
- Mazat výsledky hráčů
- Mazat hráče, kteří v ní mají výsledky

### Zapomenuté heslo:
Pokud zapomenete heslo soutěže, použijte **master heslo** (hlavní heslo). To funguje pro odemčení jakékoli soutěže. Master heslo znají správci aplikace.

---

## 11. Rozstřel – pravidla

### Rozstřel v kategorii (při zadávání výsledků)
- Pole pro rozstřel se zobrazí automaticky, pokud má hráč na 1.–2. nebo 2.–3. místě stejný počet bodů jako jiný hráč v kategorii.
- Rozstřel slouží k rozlišení pořadí, **nepřičítá se** k celkovému skóre.

### Rozstřel mezi kategoriemi (poolový)
- Funguje v rámci dvou poolů:
  - **Dospělí** = Muži + Ženy
  - **Mládež** = Chlapci + Dívky
- Systém vezme **top 3 hráče z každé kategorie** v poolu.
- Pokud mají hráči z **různých kategorií** stejný počet bodů, zobrazí se formulář pro rozstřel na stránce Výsledky.
- Příklad: Muži mají 85, 85, 80 bodů a Ženy mají 85, 80, 79 bodů → rozstřel proběhne mezi dvěma muži a jednou ženou (všichni s 85 body).

### Absolutní vítěz
- Absolutním vítězem je **vítěz kategorie** (1. místo) s nejvyšším celkovým skóre.
- Pokud mají vítězové více kategorií stejné skóre i rozstřel, zobrazí se jako „Absolutní vítězové (nerozhodnuto)".

---

## 12. Řazení soutěží

Všude v aplikaci (roletky, výpisy, historie) se soutěže řadí **od nejnovější nahoře**:

```
Jarní 2026       (nahoře – nejnovější)
Podzimní 2025
Jarní 2025
Podzimní 2024
Jarní 2024       (dole – nejstarší)
```

---

## 13. Zobrazení na různých zařízeních

- **Počítač / velká obrazovka:** Kategorie výsledků se zobrazují vedle sebe na celou šířku. Vhodné i pro promítání na projektor.
- **Tablet:** Podobně jako počítač, s mírně kompaktnějším rozložením.
- **Mobil:** Navigace v mřížce 2×4, kategorie výsledků pod sebou, tabulky horizontálně posuvné, tlačítka na celou šířku.

---

## 14. Export výsledků do PDF

1. Přejděte na **Výsledky** a vyberte soutěž.
2. Klikněte na **📄 Export PDF**.
3. PDF se automaticky stáhne.

PDF obsahuje:
- Název soutěže
- Absolutního vítěze
- Výsledky všech kategorií (pod sebou, s větším písmem pro čitelnost při tisku)

Název souboru: např. „Jarní střelby 2026.pdf".
