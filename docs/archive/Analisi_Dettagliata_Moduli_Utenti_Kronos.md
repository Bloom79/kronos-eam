# Analisi Dettagliata Moduli e Utenti - Piattaforma Kronos EAM

## 1. Analisi Mercato Target e Prospect Reali

### 1.1 Situazione Attuale Mercato Fotovoltaico Italia (2025)

**Totale impianti**: ~1.880.000 installazioni connesse (37 GW)

#### Segmentazione per Tipologia:
| Tipologia | N° Impianti | Potenza Media | Chi Gestisce | Bisogno Piattaforma |
|-----------|-------------|---------------|--------------|---------------------|
| **Residenziale <12 kW** | ~1.600.000 | 6 kW | Proprietari diretti o installatori | ❌ BASSO |
| **Commerciale 12-50 kW** | ~120.000 | 30 kW | PMI, negozi, uffici | ✅ ALTO |
| **Industriale 50-200 kW** | ~80.000 | 120 kW | Aziende medie | ✅ MOLTO ALTO |
| **Industriale 200kW-1MW** | ~25.000 | 500 kW | Grandi aziende | ⚠️ MEDIO |
| **Utility Scale >1MW** | ~5.000 | 5 MW | Fondi, utilities | ❌ BASSO |

### 1.2 Target Primario: Chi Ha REALMENTE Bisogno della Piattaforma

#### 🎯 **SWEET SPOT: Impianti Commerciali/Industriali 20-500 kW**

**Perché sono il target ideale:**
- **Troppo piccoli** per avere team interni dedicati
- **Troppo grandi** per gestione "fai da te"
- **Obblighi normativi complessi** (UTF Dogane per >20kW)
- **ROI sensibile** a fermi e inefficienze
- **Budget limitato** per consulenti esterni full-time

#### Chi NON è nostro target:
- **Residenziale <12 kW**: Gestito da installatori, no complessità
- **Utility Scale >1MW**: Hanno già EPC contractor e O&M strutturati

### 1.3 Profili Target Realistici e Dimensionamento

| Profilo | Mercato Reale | % Prospect | Utenti Target | Note |
|---------|---------------|------------|---------------|------|
| **PMI con impianti 20-200 kW** | ~50.000 | 25% | 12.500 | Core target |
| **Aziende medie 200-500 kW** | ~15.000 | 35% | 5.250 | High value |
| **Gestori multi-sito** | ~2.000 | 50% | 1.000 | Strategic |
| **O&M Provider indipendenti** | ~500 | 60% | 300 | Partner channel |
| **Consulenti energia PMI** | ~1.500 | 40% | 600 | Influencer |
| **TOTALE REALISTICO** | **~69.000** | **29%** | **19.650** | |

---

## 2. Analisi Dettagliata per Segmento Target

### 2.1 PMI con Impianti 20-200 kW (12.500 utenti target)

**Caratteristiche:**
- Fatturato: 2-50M€
- Dipendenti: 10-250
- Settori: Manifattura, logistica, retail, alimentare
- Pain points: Costi energia, compliance UTF, mancanza competenze interne

#### Moduli Critici:
| Modulo | Priorità | Valore Percepito |
|--------|----------|------------------|
| **Gestione Scadenze UTF** | ⭐⭐⭐⭐⭐ | Evita sanzioni 5.000-50.000€ |
| **Monitoraggio Performance** | ⭐⭐⭐⭐ | Identifica perdite produzione |
| **Manutenzione Preventiva** | ⭐⭐⭐⭐ | Riduce fermi non pianificati |
| **Documenti Compliance** | ⭐⭐⭐⭐⭐ | Gestione GSE, Dogane, TERNA |
| **Alert Automatici** | ⭐⭐⭐⭐ | Risposta rapida a problemi |

#### Funzionalità Esistenti ✅:
- Dashboard base performance
- Upload documenti
- Calendario scadenze

#### Funzionalità Mancanti Critiche ❌:
- **Compilazione automatica UTF** mensile/annuale
- **Calcolo automatico accise** e F24
- **Alert predittivi** basati su meteo
- **Integrazione contatori fiscali** Agenzia Dogane
- **Workflow approvazioni** multi-livello

---

### 2.2 Aziende Medie 200-500 kW (5.250 utenti target)

**Caratteristiche:**
- Fatturato: 50-500M€  
- Dipendenti: 250-1000
- Settori: Industria pesante, GDO, datacenter
- Pain points: Ottimizzazione energetica, reporting direzionale

#### Moduli Critici:
| Modulo | Priorità | Valore Percepito |
|--------|----------|------------------|
| **Energy Management System** | ⭐⭐⭐⭐⭐ | Ottimizzazione consumi |
| **Predictive Analytics** | ⭐⭐⭐⭐ | Prevenzione guasti costosi |
| **Financial Reporting** | ⭐⭐⭐⭐⭐ | Board reporting |
| **Multi-site Overview** | ⭐⭐⭐⭐ | Gestione centralizzata |
| **ISO 50001 Compliance** | ⭐⭐⭐ | Certificazioni |

#### Funzionalità Mancanti Critiche ❌:
- **Integrazione SCADA/BMS** esistenti
- **AI per ottimizzazione** consumi vs produzione
- **Simulatore scenari** energetici
- **Carbon footprint** tracking automatico
- **API per ERP** (SAP, Oracle)

#### Moduli Utilizzati:
| Modulo | Frequenza Uso | Funzionalità Chiave |
|--------|---------------|---------------------|
| **Gestione Operativa** | Giornaliera | Stato impianti, task, team |
| **Workflow Manager** | Giornaliera | Creazione/monitoraggio processi |
| **Manutenzione** | Giornaliera | Pianificazione, tracking |
| **Performance Analytics** | Settimanale | PR, availability, losses |
| **Gestione Team** | Giornaliera | Assegnazioni, carichi lavoro |

#### Funzionalità Esistenti ✅:
- Workflow base
- Calendario manutenzioni
- Assegnazione task

#### Funzionalità Mancanti ❌:
- **Ottimizzatore risorse** con AI per bilanciamento team
- **Manutenzione predittiva** basata su dati storici
- **Integrazione ERP** per spare parts
- **Mobile dispatch** real-time
- **Video-assistenza remota** per tecnici

---

### 2.3 Gestori Multi-Sito (1.000 utenti target)

**Caratteristiche:**
- Portfolio: 5-50 impianti
- Tipologia: Catene retail, banche, telecomunicazioni
- Pain points: Standardizzazione processi, economie di scala

#### Moduli Critici:
| Modulo | Priorità | Valore Percepito |
|--------|----------|------------------|
| **Portfolio Dashboard** | ⭐⭐⭐⭐⭐ | Vista aggregata real-time |
| **Comparative Analytics** | ⭐⭐⭐⭐⭐ | Benchmark tra siti |
| **Bulk Operations** | ⭐⭐⭐⭐ | Efficienza gestionale |
| **Standardized Workflows** | ⭐⭐⭐⭐⭐ | Qualità uniforme |
| **Consolidated Reporting** | ⭐⭐⭐⭐ | Report direzionali |

#### Funzionalità Mancanti Critiche ❌:
- **Template replicabili** per nuovi siti
- **Gestione contratti** multi-fornitore
- **Allocazione costi** per centro di costo
- **Mobile app** supervisore area
- **BI avanzata** con drill-down

#### Moduli Utilizzati:
| Modulo | Frequenza Uso | Funzionalità Chiave |
|--------|---------------|---------------------|
| **Monitoraggio Tecnico** | Giornaliera | SCADA lite, allarmi, performance |
| **Analisi Guasti** | Settimanale | Root cause, patterns |
| **Documentazione Tecnica** | Occasionale | Manuali, schemi, datasheet |
| **Report Tecnici** | Mensile | Performance ratio, availability |

#### Funzionalità Esistenti ✅:
- Dashboard performance
- Storico allarmi
- Repository documenti

#### Funzionalità Mancanti ❌:
- **Integrazione SCADA** diretta
- **Analisi perdite** con categorizzazione IEC
- **Simulatore producibilità** 
- **Database guasti** con ML per pattern recognition
- **Digital twin** impianti

---

### 2.4 O&M Provider Indipendenti (300 utenti target)

**Caratteristiche:**
- Gestiscono: 50-500 impianti terzi
- Modello: Service contract 10-20 anni
- Pain points: Margini bassi, efficienza operativa

#### Moduli Critici:
| Modulo | Priorità | Valore Percepito |
|--------|----------|------------------|
| **Field Service Management** | ⭐⭐⭐⭐⭐ | Ottimizzazione route |
| **Customer Portal** | ⭐⭐⭐⭐⭐ | Trasparenza cliente |
| **Inventory Management** | ⭐⭐⭐⭐ | Gestione ricambi |
| **SLA Tracking** | ⭐⭐⭐⭐⭐ | Rispetto contratti |
| **White-label Reports** | ⭐⭐⭐⭐ | Professional branding |

#### Funzionalità Mancanti Critiche ❌:
- **Multi-tenant** per clienti separati
- **Fatturazione automatica** da SLA
- **Gestione subappaltatori**
- **Knowledge base** condivisa tecnici
- **Certificazioni digitali** interventi

#### Moduli Utilizzati:
| Modulo | Frequenza Uso | Funzionalità Chiave |
|--------|---------------|---------------------|
| **App Mobile O&M** | Giornaliera | Work orders, checklist, foto |
| **Navigazione** | Giornaliera | Mappe impianti, routing |
| **Documentazione Campo** | Giornaliera | Manuali offline, schemi |
| **Magazzino** | Settimanale | Richiesta ricambi |

#### Funzionalità Esistenti ✅:
- App mobile base
- Checklist digitali
- Upload foto

#### Funzionalità Mancanti ❌:
- **Offline completo** con sync intelligente
- **Scanner QR/barcode** per componenti
- **Realtà aumentata** per manutenzione guidata
- **Voice-to-text** per note campo
- **Firma digitale** cliente

---

### 2.5 Consulenti Energia PMI (600 utenti target)

**Caratteristiche:**
- Clienti: 20-100 PMI ciascuno
- Servizi: Energy management, pratiche, incentivi
- Pain points: Scalabilità, standardizzazione servizi

#### Moduli Critici:
| Modulo | Priorità | Valore Percepito |
|--------|----------|------------------|
| **Multi-client Management** | ⭐⭐⭐⭐⭐ | Gestione scalabile |
| **Regulatory Automation** | ⭐⭐⭐⭐⭐ | Pratiche veloci |
| **Incentive Calculator** | ⭐⭐⭐⭐ | Consulenza valore |
| **Client Reporting** | ⭐⭐⭐⭐ | Professional service |
| **Document Templates** | ⭐⭐⭐⭐ | Efficienza |

#### Funzionalità Mancanti Critiche ❌:
- **CRM integrato** per lead/clienti
- **Simulatore incentivi** multi-scenario
- **Firma digitale remota** documenti
- **Area clienti** self-service
- **Automazione fatturazione** servizi

---

---

## 3. Analisi Competitiva: Chi Offre Già Cosa

### 3.1 Operatori Esistenti nel Mercato

| Competitor | Target | Punti Forza | Punti Deboli | Pricing |
|------------|--------|-------------|--------------|---------|  
| **Enel X** | Grandi aziende | Brand, integrazione completa | Costoso, rigido | 500-2000€/mese |
| **T-Green** | PMI Nord Italia | Locale, supporto diretto | Solo Nord, limitato | 200-500€/mese |
| **Solar-Log** | Tecnico | Monitoring avanzato | No compliance, no workflow | 50-200€/mese |
| **Meteocontrol** | Utility scale | Enterprise features | Troppo complesso PMI | 300-1000€/mese |
| **Consulenti locali** | PMI | Relazione personale | Non scalabile, costoso | 500-2000€/mese |

#### Moduli Utilizzati:
| Modulo | Frequenza Uso | Funzionalità Chiave |
|--------|---------------|---------------------|
| **Modulo Fiscale** | Mensile | Fatture, F24, dichiarazioni |
| **Incentivi Tracker** | Mensile | GSE, crediti imposta |
| **Report Economici** | Trimestrale | Bilanci, cash flow |

#### Funzionalità Esistenti ✅:
- Export dati contabili
- Registro fatture

#### Funzionalità Mancanti ❌:
- **Integrazione software contabili** (TeamSystem, Zucchetti)
- **Calcolo automatico** crediti imposta
- **Generazione F24** pre-compilati
- **Alert fiscali** personalizzati
- **Simulatore** impatto fiscale investimenti

---

### 3.2 Gap di Mercato = Nostra Opportunità

**Nessuno copre bene:**
1. **Compliance UTF automatizzata** per impianti 20-200kW
2. **Workflow burocratici** GSE/TERNA/Dogane integrati
3. **Prezzo accessibile** per PMI (target 100-300€/mese)
4. **Semplicità d'uso** senza formazione specialistica
5. **Supporto multilingua** (molte PMI hanno staff straniero)

---

---

## 4. Value Proposition per Segmento

### 4.1 PMI 20-200 kW
**"Zero Sanzioni, Zero Pensieri"**
- UTF automatizzato = risparmio 5-10k€/anno sanzioni
- Compliance semplificata = -80% tempo amministrativo
- Alert intelligenti = prevenzione fermi (valore 20-50k€/anno)
- ROI: 6-12 mesi

### 4.2 Aziende 200-500 kW  
**"Controllo Totale, Costi Prevedibili"**
- Energy management integrato = -10% costi energia
- Predictive maintenance = -30% fermi non pianificati
- Multi-site dashboard = -50% tempo gestione
- ROI: 12-18 mesi

### 4.3 Gestori Multi-Sito
**"Scala senza Complessità"**
- Standardizzazione = -60% training nuovo staff
- Benchmark automatico = identificazione best practices
- Reporting consolidato = board-ready in 1 click
- ROI: 9-15 mesi

### 4.4 O&M Provider
**"Margini Migliori, Clienti Più Felici"**
- Route optimization = +30% interventi/giorno
- Customer portal = -70% chiamate status
- SLA automation = fatturazione puntuale
- ROI: 6-9 mesi

---

## 5. Funzionalità Prioritarie per MVP e Roadmap

### 5.1 MVP Core (0-3 mesi) - "Compliance Zero Pensieri"
| Funzionalità | Target Primario | Valore Immediato |
|--------------|-----------------|------------------|
| **UTF Wizard** | PMI 20-200kW | Evita sanzioni immediate |
| **Calendario Smart** | Tutti | Mai più scadenze perse |
| **Document Hub** | Tutti | Tutto in un posto |
| **Alert WhatsApp** | PMI | Notifiche immediate |
| **Dashboard Mobile** | Owner/Manager | Controllo ovunque |

### 5.2 Fase 2 (3-6 mesi) - "Performance Optimizer"
| Funzionalità | Target Primario | Valore Aggiunto |
|--------------|-----------------|------------------|
| **Predictive Alerts** | Aziende 200-500kW | Prevenzione guasti |
| **Energy Analytics** | Multi-sito | Benchmark e saving |
| **Workflow Pratiche** | Tutti | Automazione GSE/TERNA |
| **OCR Fatture** | PMI | Data entry automatico |
| **API Contabilità** | Aziende medie | Integrazione ERP |

### 5.3 Fase 3 (6-12 mesi) - "Scale & Integrate"
| Funzionalità | Target Primario | Differenziazione |
|--------------|-----------------|------------------|
| **Multi-tenant Pro** | O&M Provider | White label ready |
| **SCADA Connect** | Industriali | Real-time monitoring |
| **AI Maintenance** | Tutti >100kW | Predictive planning |
| **Customer Portal** | O&M Provider | Self-service clients |
| **BI Advanced** | Multi-sito | Deep insights |

---

## 6. Metriche di Successo e KPI

### 6.1 Metriche di Adozione
| Metrica | Target 6 mesi | Target 12 mesi | Target 24 mesi |
|---------|---------------|----------------|----------------|
| **Clienti Attivi** | 500 | 2.000 | 5.000 |
| **MRR (€)** | 75k | 400k | 1.2M |
| **Churn Rate** | <5% | <3% | <2% |
| **NPS** | >40 | >50 | >60 |
| **Impianti Gestiti** | 1.000 | 5.000 | 15.000 |

### 6.2 Metriche di Valore
| Metrica | Impatto Cliente | Target |
|---------|-----------------|--------|
| **Sanzioni Evitate** | 5-50k€/anno | 100% |
| **Tempo Risparmiato** | ore/settimana | >10h |
| **Downtime Ridotto** | giorni/anno | -30% |
| **ROI Platform** | mesi payback | <12 |
| **Compliance Rate** | % conformità | >98% |

---

## 7. Pricing Strategy

### 7.1 Modello SaaS per Impianto (non per utente)

| Tier | Target | €/mese per impianto | Features Incluse |
|------|--------|---------------------|------------------|
| **Starter** | 20-50 kW | 99 | Compliance, alerts, 2 utenti |
| **Professional** | 50-200 kW | 199 | + Analytics, workflow, 5 utenti |
| **Business** | 200-500 kW | 399 | + Predictive, API, 10 utenti |
| **Enterprise** | >500 kW o Multi-sito | Custom | Full platform, utenti illimitati |

### 7.2 Add-on Opzionali
| Add-on | €/mese | Valore |
|--------|---------|--------|
| **UTF Automation** | +50 | Compilazione automatica |
| **SCADA Connect** | +100 | Real-time monitoring |
| **White Label** | +200 | Per O&M provider |
| **Priority Support** | +50 | SLA 2h response |
| **Extra Storage** | +30/TB | Documenti illimitati |

---

## 8. Go-to-Market Strategy

### 8.1 Canali di Acquisizione

| Canale | Target | CAC Stimato | Conversione |
|--------|--------|-------------|-------------|
| **Partner O&M** | PMI via provider | 200€ | 25% |
| **Associazioni** | Confindustria locale | 300€ | 20% |
| **Webinar Compliance** | PMI dirette | 150€ | 15% |
| **Consulenti Energia** | Referral | 100€ | 35% |
| **Google Ads** | "UTF fotovoltaico" | 400€ | 10% |

### 8.2 Pilot Program (Primi 6 mesi)
- **50 clienti pilota** con 50% sconto
- **Case studies** per vertical (manufacturing, retail, logistica)
- **Referral program** 20% commissione primo anno
- **Partnership** con 2-3 O&M provider regionali

### 8.3 Messaggi Chiave per Vertical

| Settore | Pain Point | Messaggio |
|---------|------------|-----------|  
| **Manufacturing** | Costi energia | "Riduci i costi energetici del 15%" |
| **Retail/GDO** | Multi-sito | "Gestisci 50 punti vendita con 1 click" |
| **Logistica** | Compliance | "Zero sanzioni UTF garantito" |
| **Alimentare** | Continuità | "Mai più fermi non pianificati" |

---

## 9. Conclusioni e Next Steps

### Target Realistico
- **Mercato Totale**: 69.000 prospect qualificati
- **Target 5 anni**: 19.650 clienti (28.5% market share)
- **Sweet Spot**: PMI con impianti 20-500 kW
- **MRR Target Year 3**: 1.2M€ (6.000 impianti x 200€ average)

### Fattori Critici di Successo
1. **UTF Automation** come killer feature
2. **Semplicità** estrema UI/UX
3. **Prezzo** accessibile PMI
4. **Partner Channel** per scala
5. **Supporto Eccellente** in italiano

### Prossimi Passi
1. **Validazione** con 10 PMI target
2. **MVP Development** focus UTF
3. **Partnership** 1 O&M provider
4. **Pilot Launch** 50 clienti
5. **Iterate & Scale**