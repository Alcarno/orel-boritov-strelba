# Graf struktury aplikace - Orel Bořitov

## Datový model - Entity Relationship Diagram

```mermaid
erDiagram
    PLAYER ||--o{ RESULT : "má"
    COMPETITION ||--o{ RESULT : "obsahuje"
    
    PLAYER {
        string id PK
        string name
        string category
        date createdAt
    }
    
    COMPETITION {
        string id PK
        number year
        string type
        date date
        boolean locked
        string password
        object absoluteWinnerRozstrel
    }
    
    RESULT {
        string id PK
        string playerId FK
        string competitionId FK
        number round1
        number round2
        number rozstrel
        number total
        string categoryAtTime
        date createdAt
    }
```

## Procesní tok - Kompletní workflow

```mermaid
graph TB
    Start([Spuštění aplikace]) --> Load[Načtení dat z localStorage]
    Load --> Home[Domů - Přehled]
    
    Home --> Reg[Registrace hráče]
    Home --> Comp[Vytvořit soutěž]
    Home --> Add[Zadat výsledky]
    Home --> View[Výsledky soutěží]
    Home --> Hist[Historie hráče]
    Home --> Stat[Statistiky]
    Home --> Manage[Správa]
    Home --> Lock[Uzamknout/Odemknout]
    
    Reg --> CheckDup{Kontrola duplicit?}
    CheckDup -->|Stejná kat.| Error1[CHYBA]
    CheckDup -->|Jiná kat.| Offer[Nabídnout převod]
    CheckDup -->|Žádná| Create[Vytvořit hráče]
    Offer --> Transfer{Povolený převod?}
    Transfer -->|Ano| TransferOK[Převést hráče]
    Transfer -->|Ne| Error2[CHYBA]
    Create --> CreateResult[Vytvořit výsledek]
    TransferOK --> CreateResult
    
    Add --> SelectComp[Vybrat soutěž]
    SelectComp --> SelectPlayer[Vybrat hráče]
    SelectPlayer --> Input1[Zadat Kolo 1]
    Input1 --> Input2[Zadat Kolo 2]
    Input2 --> CalcTotal[Výpočet: total = round1 + round2]
    CalcTotal --> CheckCatTie{Shoda na 1-3 místě<br/>v kategorii?}
    CheckCatTie -->|Ano| InputRozstrel[Zadat rozstřel v kategorii]
    CheckCatTie -->|Ne| CheckAbsTie{Je hráč na 1. místě<br/>v kategorii?}
    InputRozstrel --> CheckAbsTie
    CheckAbsTie -->|Ano| CheckAbsTie2{Mají vítězové<br/>kategorií stejný total?}
    CheckAbsTie -->|Ne| Save[Uložit výsledky]
    CheckAbsTie2 -->|Ano| InputAbsRozstrel[Zadat rozstřel<br/>o absolutního vítěze]
    CheckAbsTie2 -->|Ne| Save
    InputAbsRozstrel --> Save
    
    Save --> Recalc[Přepočítat pořadí]
    Recalc --> CalcCat[Určit vítěze kategorií]
    CalcCat --> CalcAbs[Určit absolutního vítěze<br/>podle rozstřelu]
    CalcAbs --> Display[Zobrazit výsledky]
    
    View --> SelectComp2[Vybrat soutěž]
    SelectComp2 --> CalcResults[Výpočet výsledků]
    CalcResults --> ShowResults[Zobrazit výsledky]
    ShowResults --> PDF[Generovat PDF]
    
    Manage --> ManagePlayers[Správa hráčů]
    Manage --> ManageResults[Správa výsledků]
    Manage --> ManageComp[Správa soutěží]
    
    ManagePlayers --> ChangeCat[Změnit kategorii]
    ManagePlayers --> DeletePlayer[Smazat hráče]
    ChangeCat --> ValidateCat{Povolený převod?}
    ValidateCat -->|Ano| UpdateCat[Aktualizovat kategorii]
    ValidateCat -->|Ne| Error3[CHYBA]
    
    Lock --> SelectComp3[Vybrat soutěž]
    SelectComp3 --> CheckLock{Je uzamčena?}
    CheckLock -->|Ne| LockAction[Uzamknout s heslem]
    CheckLock -->|Ano| UnlockAction[Odemknout s heslem]
    
    style Start fill:#e1f5ff
    style Home fill:#fff4e1
    style Save fill:#e8f5e9
    style Error1 fill:#ffebee
    style Error2 fill:#ffebee
    style Error3 fill:#ffebee
```

## Hierarchie kategorií a přechody

```mermaid
graph TD
    Boys[Chlapci do 15 let] -->|Přechod při dosažení věku| Men[Muži od 16 let]
    Girls[Dívky do 15 let] -->|Přechod při dosažení věku| Women[Ženy od 16 let]
    
    Boys -.->|❌ Zakázáno| Girls
    Boys -.->|❌ Zakázáno| Women
    Girls -.->|❌ Zakázáno| Boys
    Girls -.->|❌ Zakázáno| Men
    Men -.->|❌ Zakázáno| Boys
    Men -.->|❌ Zakázáno| Girls
    Men -.->|❌ Zakázáno| Women
    Women -.->|❌ Zakázáno| Boys
    Women -.->|❌ Zakázáno| Girls
    Women -.->|❌ Zakázáno| Men
    
    style Boys fill:#e3f2fd
    style Girls fill:#fce4ec
    style Men fill:#fff3e0
    style Women fill:#f3e5f5
```

## Proces určení absolutního vítěze

```mermaid
flowchart TD
    Start([Všechny výsledky zadané]) --> CalcCat[Výpočet pořadí v kategoriích]
    CalcCat --> FindWinners[Načíst vítěze kategorií<br/>1. místo v každé kategorii]
    
    FindWinners --> GroupByTotal[Seskupit vítěze podle total]
    GroupByTotal --> CheckTie{Shoda total<br/>mezi vítězi?}
    
    CheckTie -->|Ne| Winner1[Absolutní vítěz:<br/>Vítěz s nejvyšším total]
    CheckTie -->|Ano| CheckRozstrel{Mají všichni<br/>rozstřel o absolutního vítěze?}
    
    CheckRozstrel -->|Ne| NeedRozstrel[Zobrazit pole pro rozstřel<br/>o absolutního vítěze]
    CheckRozstrel -->|Ano| CompareRozstrel[Porovnat rozstřely]
    
    CompareRozstrel --> Winner2[Absolutní vítěz:<br/>Vítěz s nejvyšším rozstřelem]
    
    NeedRozstrel --> InputRozstrel[Zadat rozstřel o absolutního vítěze]
    InputRozstrel --> SaveRozstrel[Uložit rozstřel]
    SaveRozstrel --> CompareRozstrel
    
    Winner1 --> End([Konec])
    Winner2 --> End
    
    style Start fill:#e1f5ff
    style Winner1 fill:#c8e6c9
    style Winner2 fill:#c8e6c9
    style NeedRozstrel fill:#fff9c4
```

## Struktura rozstřelů

```mermaid
graph LR
    Result[Výsledek hráče] --> Round1[Kolo 1: 0-50]
    Result --> Round2[Kolo 2: 0-50]
    Round1 --> Total[Total = round1 + round2]
    Round2 --> Total
    
    Total --> CatTie{Shoda na 1-3 místě<br/>v kategorii?}
    CatTie -->|Ano| CatRozstrel[Rozstřel v kategorii: 0-50]
    CatTie -->|Ne| NoCatRozstrel[Bez rozstřelu v kategorii]
    
    CatRozstrel --> CatPosition[Určení pořadí v kategorii]
    NoCatRozstrel --> CatPosition
    
    CatPosition --> IsWinner{Je hráč na 1. místě<br/>v kategorii?}
    IsWinner -->|Ano| AbsTie{Mají vítězové kategorií<br/>stejný total?}
    IsWinner -->|Ne| NoAbsRozstrel[Bez rozstřelu o absolutního vítěze]
    
    AbsTie -->|Ano| AbsRozstrel[Rozstřel o absolutního vítěze: 0-50]
    AbsTie -->|Ne| NoAbsRozstrel
    
    AbsRozstrel --> AbsWinner[Určení absolutního vítěze]
    NoAbsRozstrel --> AbsWinner
    
    style Total fill:#fff4e1
    style CatRozstrel fill:#e3f2fd
    style AbsRozstrel fill:#f3e5f5
    style AbsWinner fill:#c8e6c9
```

## Datový tok při zadávání výsledků

```mermaid
sequenceDiagram
    participant U as Uživatel
    participant UI as Formulář
    participant V as Validace
    participant S as Storage
    participant C as Výpočet
    
    U->>UI: Vyplní kola 1 a 2
    UI->>V: Odeslání formuláře
    V->>V: Kontrola: 0-50 bodů?
    V->>V: Kontrola: Soutěž uzamčena?
    V->>C: Výpočet total = round1 + round2
    C->>C: Kontrola: Shoda na 1-3 místě?
    C-->>UI: Zobrazit pole pro rozstřel v kategorii
    U->>UI: Zadat rozstřel v kategorii
    C->>C: Kontrola: Je hráč na 1. místě?
    C->>C: Kontrola: Shoda total mezi vítězi kategorií?
    C-->>UI: Zobrazit pole pro rozstřel o absolutního vítěze
    U->>UI: Zadat rozstřel o absolutního vítěze
    UI->>S: Uložit výsledek
    UI->>S: Uložit rozstřel o absolutního vítěze
    S->>C: Přepočítat pořadí
    C->>C: Seřadit podle total
    C->>C: Seřadit podle rozstřelu v kategorii
    C->>C: Určit vítěze kategorií
    C->>C: Seřadit podle rozstřelu o absolutního vítěze
    C->>C: Určit absolutního vítěze
    C-->>UI: Zobrazit aktualizované výsledky
```

## Komponenty aplikace

```mermaid
graph TB
    App[Aplikace] --> Home[Domů]
    App --> Register[Registrace hráče]
    App --> Competition[Vytvořit soutěž]
    App --> AddResults[Zadat výsledky]
    App --> ViewResults[Výsledky soutěží]
    App --> History[Historie hráče]
    App --> Statistics[Statistiky]
    App --> Manage[Správa]
    
    Home --> Stats[Statistiky]
    Home --> QuickActions[Rychlé akce]
    Home --> LockSection[Uzamknout/Odemknout]
    
    Register --> Form1[Formulář registrace]
    Form1 --> Validation1[Validace]
    Validation1 --> Storage1[Storage API]
    
    AddResults --> Form2[Formulář výsledků]
    Form2 --> Validation2[Validace]
    Validation2 --> Calculation[Výpočet pořadí]
    Calculation --> Storage2[Storage API]
    
    ViewResults --> Display[Zobrazení výsledků]
    Display --> PDFGen[Generování PDF]
    
    Statistics --> Aggregation[Agregace dat]
    Aggregation --> Display2[Zobrazení statistik]
    
    Manage --> PlayersMgmt[Správa hráčů]
    Manage --> ResultsMgmt[Správa výsledků]
    Manage --> CompMgmt[Správa soutěží]
    
    Storage1 --> LocalStorage[(localStorage)]
    Storage2 --> LocalStorage
    
    style App fill:#8b6914,color:#fff
    style LocalStorage fill:#f3e5f5
    style Calculation fill:#fff4e1
    style PDFGen fill:#e8f5e9
```

## Pravidla a validace

```mermaid
flowchart TD
    Action([Akce uživatele]) --> Type{Typ akce?}
    
    Type -->|Registrace| RegRules[Pravidla registrace]
    Type -->|Zadání výsledků| ResultRules[Pravidla zadání]
    Type -->|Změna kategorie| CatRules[Pravidla změny kategorie]
    Type -->|Uzamčení| LockRules[Pravidla uzamčení]
    
    RegRules --> CheckName{Duplicitní jméno?}
    CheckName -->|Stejná kat.| Error1[❌ CHYBA]
    CheckName -->|Jiná kat.| CheckTransfer{Povolený převod?}
    CheckName -->|Žádná| OK1[✅ Vytvořit]
    CheckTransfer -->|Chlapci→Muži| OK2[✅ Převést]
    CheckTransfer -->|Dívky→Ženy| OK2
    CheckTransfer -->|Ostatní| Error2[❌ CHYBA]
    
    ResultRules --> CheckLock2{Soutěž uzamčena?}
    CheckLock2 -->|Ano| CheckPass{Správné heslo?}
    CheckLock2 -->|Ne| OK3[✅ Povolit]
    CheckPass -->|Ano| OK3
    CheckPass -->|Ne| Error3[❌ Odmítnout]
    
    CatRules --> CheckCat{Povolený převod?}
    CheckCat -->|Chlapci→Muži| OK4[✅ Povolit]
    CheckCat -->|Dívky→Ženy| OK4
    CheckCat -->|Ostatní| Error4[❌ Zakázáno]
    
    LockRules --> CheckLock3{Již uzamčena?}
    CheckLock3 -->|Ne| LockOK[✅ Uzamknout]
    CheckLock3 -->|Ano| UnlockOK[✅ Odemknout]
    
    style Error1 fill:#ffebee
    style Error2 fill:#ffebee
    style Error3 fill:#ffebee
    style Error4 fill:#ffebee
    style OK1 fill:#c8e6c9
    style OK2 fill:#c8e6c9
    style OK3 fill:#c8e6c9
    style OK4 fill:#c8e6c9
    style LockOK fill:#c8e6c9
    style UnlockOK fill:#c8e6c9
```

## Rozstřel - rozhodovací strom

```mermaid
flowchart TD
    Start([Hráč má zadaná obě kola]) --> Calc[total = round1 + round2]
    Calc --> CheckCat{Shoda total na 1-3 místě<br/>v kategorii?}
    
    CheckCat -->|Ano| NeedCatRozstrel[Potřeba rozstřel<br/>v kategorii]
    CheckCat -->|Ne| CheckPosition{Je hráč na 1. místě<br/>v kategorii?}
    
    NeedCatRozstrel --> InputCatRozstrel[Zadat rozstřel v kategorii]
    InputCatRozstrel --> RecalcCat[Přepočítat pořadí v kategorii]
    RecalcCat --> CheckPosition
    
    CheckPosition -->|Ano| CheckAbsTie{Mají vítězové kategorií<br/>stejný total?}
    CheckPosition -->|Ne| NoRozstrel[Bez rozstřelu]
    
    CheckAbsTie -->|Ano| NeedAbsRozstrel[Potřeba rozstřel<br/>o absolutního vítěze]
    CheckAbsTie -->|Ne| NoRozstrel
    
    NeedAbsRozstrel --> InputAbsRozstrel[Zadat rozstřel o absolutního vítěze]
    InputAbsRozstrel --> RecalcAbs[Přepočítat absolutního vítěze]
    RecalcAbs --> End([Hotovo])
    
    NoRozstrel --> End
    
    style NeedCatRozstrel fill:#fff9c4
    style NeedAbsRozstrel fill:#fff9c4
    style End fill:#c8e6c9
```

## Architektura ukládání dat

```mermaid
graph TB
    UI[Uživatelské rozhraní] --> API[Storage API]
    
    API --> Players[storage.players]
    API --> Competitions[storage.competitions]
    API --> Results[storage.results]
    
    Players --> LS1[(localStorage<br/>orel_boritov_players)]
    Competitions --> LS2[(localStorage<br/>orel_boritov_competitions)]
    Results --> LS3[(localStorage<br/>orel_boritov_results)]
    
    Players --> Methods1[getAll<br/>getById<br/>add<br/>update<br/>delete]
    Competitions --> Methods2[getAll<br/>getById<br/>add<br/>update<br/>getByCompetitionId]
    Results --> Methods3[getAll<br/>getById<br/>add<br/>update<br/>getByCompetitionId<br/>getByPlayerId]
    
    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style LS1 fill:#f3e5f5
    style LS2 fill:#f3e5f5
    style LS3 fill:#f3e5f5
```

## Kompletní životní cyklus výsledku

```mermaid
stateDiagram-v2
    [*] --> Vytvoren: Registrace hráče
    Vytvoren --> Kolo1: Zadat Kolo 1
    Kolo1 --> Kolo2: Zadat Kolo 2
    Kolo2 --> RozstrelKat: Shoda na 1-3 místě?
    RozstrelKat --> RozstrelAbs: Je na 1. místě v kategorii?
    Kolo2 --> RozstrelAbs: Je na 1. místě v kategorii?
    RozstrelAbs --> Hotovo: Vše zadané
    RozstrelKat --> Hotovo: Rozstřel v kategorii zadaný
    
    Hotovo --> Uzamceno: Soutěž uzamčena
    Uzamceno --> Hotovo: Soutěž odemčena
    
    Hotovo --> Oprava: Oprava ve Správě
    Oprava --> Hotovo: Uloženo
    
    note right of Vytvoren
        round1 = null
        round2 = null
        total = 0
    end note
    
    note right of Hotovo
        total = round1 + round2
        (bez rozstřelu)
    end note
```

## Vztahy mezi entitami - detailní pohled

```mermaid
graph TB
    subgraph "Hráč"
        P1[Player]
        P1 --> P2[id]
        P1 --> P3[name]
        P1 --> P4[category]
        P1 --> P5[createdAt]
    end
    
    subgraph "Soutěž"
        C1[Competition]
        C1 --> C2[id]
        C1 --> C3[year, type]
        C1 --> C4[date]
        C1 --> C5[locked, password]
        C1 --> C6[absoluteWinnerRozstrel]
    end
    
    subgraph "Výsledek"
        R1[Result]
        R1 --> R2[id]
        R1 --> R3[playerId]
        R1 --> R4[competitionId]
        R1 --> R5[round1, round2]
        R1 --> R6[rozstrel]
        R1 --> R7[total]
        R1 --> R8[categoryAtTime]
    end
    
    P1 -->|1:N| R1
    C1 -->|1:N| R1
    C6 -->|N:1| P1
    
    style P1 fill:#e3f2fd
    style C1 fill:#fff3e0
    style R1 fill:#f3e5f5
```

## Poznámky k diagramům

Všechny diagramy jsou vytvořené v Mermaid formátu a lze je zobrazit:
- V VS Code s rozšířením "Markdown Preview Mermaid Support"
- Na GitHub (automatické renderování)
- Online na https://mermaid.live/
- V HTML souboru `procesni-mapa-vizualizace.html`

