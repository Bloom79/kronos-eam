Piano Operativo: Dettaglio dei Workflow Amministrativi per Kronos EAM
Introduzione
Questo documento delinea in dettaglio i processi amministrativi e i flussi di lavoro che la piattaforma Kronos EAM è progettata per gestire, automatizzare e tracciare. L'obiettivo è tradurre i requisiti di alto livello del progetto  in una mappatura precisa delle interazioni, dei documenti e delle scadenze richieste dai principali stakeholder istituzionali del settore energetico italiano. Questa analisi servirà come blueprint per lo sviluppo dei moduli di workflow, anagrafica e agenda della piattaforma.   

Fase 1: Workflow di Attivazione per un Nuovo Impianto
Questo è il processo più complesso e critico che Kronos EAM andrà a digitalizzare. Coinvolge interazioni coordinate con il Distributore di rete (DSO), Terna (TSO), il Gestore dei Servizi Energetici (GSE) e, in alcuni casi, l'Agenzia delle Dogane. La piattaforma guiderà l'utente attraverso ogni fase, assicurando la corretta sottomissione della documentazione e il rispetto delle tempistiche.

1.1 Interazione con il Distributore di Rete (DSO)
Questa fase riguarda la connessione fisica dell'impianto alla rete elettrica locale.

Task 1: Richiesta di Connessione

Azione: L'utente (asset manager o sviluppatore) avvia il workflow "Nuova Connessione" su Kronos EAM. La piattaforma guida alla compilazione della domanda di connessione da inoltrare al DSO competente (es. E-Distribuzione) tramite il loro portale online o PEC.   

Documenti da allegare (gestiti da Kronos EAM):

Copia del documento d'identità del titolare dell'impianto.   

Mandato di rappresentanza (se l'utente agisce per conto del proprietario).   

Schema elettrico unifilare generale dell'impianto.   

Planimetria catastale del sito di installazione.   

Dichiarazione sostitutiva di atto notorio attestante la disponibilità del sito.   

Pagamento: La piattaforma notifica all'utente la necessità di pagare il corrispettivo per l'ottenimento del preventivo. I costi sono variabili in base alla potenza :   

Fino a 6 kW: € 30 + IVA

Da 6 kW a 10 kW: € 50 + IVA

Il pagamento può essere effettuato online o tramite bonifico, e la ricevuta deve essere caricata sulla piattaforma.   

Task 2: Gestione del Preventivo (TICA)

Azione: Il DSO elabora e invia il preventivo per i lavori di connessione, noto come TICA (Testo Integrato Connessioni Attive). Kronos EAM riceve la notifica e la presenta all'utente.   

Tempistiche del DSO:

20 giorni lavorativi per potenze fino a 100 kW.

45 giorni lavorativi per potenze da 100 kW a 1.000 kW.

60 giorni lavorativi per potenze superiori a 1.000 kW.   

Scadenza per l'utente: Il preventivo ha una validità di 45 giorni lavorativi. Kronos EAM inserirà questa scadenza nell'agenda e invierà promemoria per l'accettazione e il pagamento.   

Task 3: Comunicazione di Fine Lavori

Azione: Una volta completata l'installazione fisica dell'impianto, l'utente utilizza Kronos EAM per inviare la "Comunicazione di Fine Lavori" al DSO.   

Documenti da allegare (gestiti da Kronos EAM):

Regolamento di Esercizio sottoscritto.   

Dichiarazione di conformità dell'impianto (DM 37/08).   

Dichiarazione di conformità degli inverter e dei Sistemi di Protezione di Interfaccia (SPI) alle norme CEI 0-21 (bassa tensione) o CEI 0-16 (media tensione).   

Copia del report di verifica effettuata sul SPI con cassetta prova relè.   

Nota sul Modello Unico: Per impianti fotovoltaici fino a 200 kW, è possibile utilizzare un iter semplificato chiamato "Modello Unico". In questo caso, la comunicazione avviene solo con il DSO, che si occuperà di inoltrare le informazioni a Terna e GSE. Kronos EAM supporterà la compilazione di entrambe le parti del Modello Unico (Parte I prima dei lavori, Parte II a fine lavori).   

1.2 Interazione con Terna
Questa fase è cruciale per il censimento ufficiale dell'impianto nella rete nazionale.

Task 1: Registrazione su GAUDÌ

Azione: Kronos EAM gestisce la registrazione dell'impianto sul portale GAUDÌ (Gestione Anagrafica Unica Degli Impianti) di Terna, un passaggio obbligatorio per tutti gli impianti di produzione.   

Dati da inserire (presenti nell'Anagrafica di Kronos EAM):

Dati del produttore e dell'impianto.

Codice POD e codice di rintracciabilità della pratica di connessione (ricevuti dal DSO).

Dettagli tecnici: tipologia dei pannelli (marca, modello, potenza), dettagli degli inverter.   

Flusso di Dati (gestito da Kronos EAM): La piattaforma traccerà i flussi di comunicazione standardizzati tra DSO e Terna (es. G01, G02, G04) per monitorare lo stato di validazione e attivazione dell'impianto su GAUDÌ.   

Task 2: Gestione Documentazione Tecnica per Media/Alta Tensione

Azione: Per impianti connessi in Media o Alta Tensione, Kronos EAM gestirà la documentazione aggiuntiva richiesta da Terna.

Documenti:

STMG/STMD (Soluzione Tecnica Minima Generale/di Dettaglio): Il preventivo di connessione fornito da Terna.   

Documentazione di progetto: Schemi elettrici dettagliati, dichiarazioni di conformità alla norma CEI 0-16, e relazioni tecniche specifiche.   

1.3 Interazione con il Gestore dei Servizi Energetici (GSE)
Questa fase riguarda l'attivazione dei meccanismi di incentivazione e remunerazione dell'energia.

Task 1: Attivazione Convenzioni

Azione: A seguito dell'attivazione della connessione, l'utente, tramite Kronos EAM, invia la richiesta al GSE per attivare la convenzione desiderata.   

Opzioni Principali:

Ritiro Dedicato (RID): Un regime di vendita semplificata dell'energia immessa in rete. La richiesta può essere fatta tramite Modello Unico (per impianti fino a 200 kW) o con procedura standard sul portale GSE.   

Scambio sul Posto (SSP): Meccanismo in via di superamento, non più disponibile per nuovi impianti dopo il 2025.   

Task 2: Gestione Pratica Antimafia

Azione: Per tutti gli impianti che riceveranno incentivi per un valore complessivo superiore a 150.000 € sull'intero periodo, è obbligatorio presentare la dichiarazione antimafia.   

Processo: Kronos EAM guiderà l'utente nella compilazione della modulistica richiesta dal GSE e ne gestirà l'invio tramite il portale dedicato.   

Scadenza: Questo adempimento è annuale e la sua omissione può portare alla sospensione degli incentivi. L'agenda di Kronos EAM traccerà questa scadenza critica.   

Fase 2: Workflow degli Adempimenti Ricorrenti in Esercizio
Una volta che l'impianto è operativo, Kronos EAM continua a supportare l'asset manager gestendo gli adempimenti periodici, in particolare quelli fiscali con l'Agenzia delle Dogane e dei Monopoli.

2.1 Adempimenti con l'Agenzia delle Dogane e dei Monopoli (per impianti > 20 kW)
Questi adempimenti sono obbligatori per tutti gli impianti con potenza superiore a 20 kW che autoconsumano anche solo parzialmente l'energia prodotta.   

Task 1: Denuncia di Officina Elettrica e Licenza di Esercizio

Azione: All'attivazione dell'impianto, è necessario presentare la "Denuncia di Officina Elettrica" all'ufficio territoriale delle Dogane per ottenere la licenza di esercizio. Kronos EAM fornirà i modelli e traccerà lo stato della richiesta.   

Task 2: Dichiarazione Annuale di Consumo

Azione: Kronos EAM assisterà nella preparazione della dichiarazione annuale di produzione e consumo.

Scadenza: La dichiarazione deve essere inviata telematicamente entro il 31 marzo di ogni anno.   

Modalità di invio: L'invio avviene tramite il Portale Unico Dogane Monopoli (PUDM), accedendo con SPID o CNS, oppure tramite software di terze parti che utilizzano il canale System-to-System (S2S) basato su tracciati E.D.I.. Kronos EAM sarà predisposto per generare il file nel formato corretto.   

Task 3: Pagamento Diritto Annuale di Licenza

Azione: Pagamento del diritto annuale per il mantenimento della licenza di esercizio.

Scadenza: Il versamento deve essere effettuato tra il 1° e il 16 dicembre di ogni anno.   

Importo: L'importo è fisso: € 23,24 per autoconsumo e € 77,47 per uso commerciale.   

Modalità di pagamento: Tramite modello F24, utilizzando il codice tributo 2813. Kronos EAM genererà un promemoria con tutti i dettagli per il pagamento.   

Task 4: Vidimazione Registri Fiscali

Azione: Tenuta dei registri di produzione con annotazione mensile delle letture dei contatori fiscali.   

Semplificazione: A partire dal 1° aprile 2025, è stato eliminato l'obbligo di vidimazione preventiva annuale dei registri presso l'Agenzia delle Dogane, semplificando notevolmente l'adempimento. Kronos EAM manterrà un registro digitale delle letture per garantire la conformità.   

Task 5: Taratura Periodica dei Contatori

Azione: Verifica periodica dei gruppi di misura fiscali da parte di un laboratorio accreditato.

Scadenza: La periodicità è tipicamente triennale per i contatori elettronici statici. L'agenda di Kronos EAM traccerà questa scadenza per pianificare l'intervento.   

2.2 Adempimenti Ricorrenti con altri Enti
Task 1: Comunicazione Fuel Mix al GSE

Azione: I produttori devono comunicare annualmente al GSE la composizione del proprio mix energetico.

Scadenza: La comunicazione va effettuata entro il 31 marzo di ogni anno tramite il portale dedicato del GSE. Kronos EAM ricorderà la scadenza e faciliterà la raccolta dei dati necessari.   

Task 2: Verifica Periodica dei Sistemi di Protezione (SPI/SPG)

Azione: Verifica strumentale (con cassetta prova relè) dei sistemi di protezione di interfaccia e generali.

Scadenza: La norma CEI 0-16/0-21 prevede una verifica periodica ogni 5 anni. La mancata verifica può comportare la sospensione degli incentivi. Kronos EAM inserirà questa scadenza nell'agenda per ogni impianto.   

Fase 3: Workflow per la Gestione di Variazioni e Manutenzione
Oltre ai processi di attivazione e agli adempimenti ricorrenti, la piattaforma gestirà le variazioni che possono occorrere durante la vita dell'impianto.

Workflow di Revamping/Potenziamento: Gestione della pratica di modifica della connessione esistente con il DSO e aggiornamento dei dati su GAUDÌ e presso il GSE.   

Workflow di Voltura: Gestione del cambio di titolarità dell'impianto, con comunicazione a tutti gli enti coinvolti (DSO, Terna, GSE, Dogane) per aggiornare anagrafiche e contratti.   

Gestione Ordinaria: Tracciamento di interventi di manutenzione, guasti e sinistri, con archiviazione di report e documentazione fotografica per creare uno storico completo dell'asset.