"""
Document Templates for Italian Renewable Energy Bureaucratic Process
Updated for 2025 regulations
"""

from app.models.document import DocumentCategoryEnum

# Official document templates required for solar panel installation process
DOCUMENT_TEMPLATES = [
    {
        "name": "Modello Unico Parte I - Avvio Lavori",
        "description": "Modello unico per comunicazione inizio lavori impianti fino a 200 kW",
        "category": DocumentCategoryEnum.AUTORIZZATIVO,
        "template_type": "pdf",
        "uso": "DSO Connection Request",
        "variables": {
            # Anagrafica richiedente
            "richiedente_nome": {"type": "string", "source": "plant.registry.owner"},
            "richiedente_cf": {"type": "string", "source": "plant.registry.tax_code"},
            "richiedente_pec": {"type": "string", "source": "plant.registry.pec"},
            "richiedente_telefono": {"type": "string", "source": "plant.registry.phone"},
            
            # Dati impianto
            "impianto_tipo": {"type": "string", "source": "plant.type"},
            "impianto_potenza_kw": {"type": "number", "source": "plant.power_kw"},
            "impianto_indirizzo": {"type": "string", "source": "plant.address"},
            "impianto_comune": {"type": "string", "source": "plant.municipality"},
            "impianto_provincia": {"type": "string", "source": "plant.province"},
            
            # Configurazione tecnica
            "moduli_marca": {"type": "string", "source": "plant.registry.module_manufacturer"},
            "moduli_modello": {"type": "string", "source": "plant.registry.module_model"},
            "moduli_quantita": {"type": "number", "source": "plant.registry.module_count"},
            "inverter_marca": {"type": "string", "source": "plant.registry.inverter_manufacturer"},
            "inverter_modello": {"type": "string", "source": "plant.registry.inverter_model"},
            
            # POD esistente (se presente)
            "pod_esistente": {"type": "string", "source": "plant.registry.pod", "optional": True}
        },
        "required_attachments": [
            "Schema elettrico unifilare",
            "Documento identità richiedente",
            "Delega (se presente)",
            "Documentazione servizio misura"
        ],
        "official_template_url": "https://www.e-distribuzione.it/content/dam/e-distribuzione/documenti/connessione_alla_rete/produttori/Modello_Unico_Parte_I_2025.pdf",
        "portal_download_page": "https://www.e-distribuzione.it/it-IT/Pagine/modello-unico-semplificato.aspx",
        "alternate_sources": [
            {"name": "ARERA", "url": "https://www.arera.it/it/operatori/operatori_ele/modellounico.htm"},
            {"name": "Portale TICA", "url": "https://www.terna.it/it/sistema-elettrico/codici-rete/codice-rete-italiano-vigente"}
        ],
        "last_updated": "2025-01-01",
        "version": "3.0 - DM 15/2024"
    },
    
    {
        "name": "Modello Unico Parte II - Fine Lavori",
        "description": "Modello unico per comunicazione fine lavori e dati as-built",
        "category": DocumentCategoryEnum.TECNICO,
        "template_type": "pdf",
        "uso": "DSO Work Completion",
        "variables": {
            # Riferimento pratica
            "pratica_codice": {"type": "string", "source": "workflow.tasks.practice_code"},
            
            # Dati tecnici as-built
            "potenza_installata_kwp": {"type": "number", "source": "plant.power_kw"},
            "moduli_seriali": {"type": "array", "source": "plant.registry.module_serial_numbers"},
            "inverter_seriali": {"type": "array", "source": "plant.registry.inverter_serial_numbers"},
            "inverter_firmware": {"type": "string", "source": "plant.registry.inverter_firmware_version"},
            
            # Autorizzazione accrediti GSE
            "gse_iban": {"type": "string", "source": "custom_input"},
            "gse_regime_fiscale": {"type": "string", "source": "custom_input"},
            
            # Dichiarazioni conformità
            "conformita_impianto": {"type": "boolean", "default": True},
            "conformita_componenti": {"type": "boolean", "default": True}
        },
        "required_attachments": [
            "Dichiarazione di conformità impianto (DM 37/08)",
            "Dichiarazioni conformità componenti",
            "Test report SPI",
            "Regolamento di esercizio firmato"
        ],
        "official_template_url": "https://www.e-distribuzione.it/content/dam/e-distribuzione/documenti/connessione_alla_rete/produttori/Modello_Unico_Parte_II_2025.pdf",
        "portal_download_page": "https://www.e-distribuzione.it/it-IT/Pagine/modello-unico-semplificato.aspx",
        "alternate_sources": [
            {"name": "ARERA", "url": "https://www.arera.it/it/operatori/operatori_ele/modellounico.htm"}
        ],
        "last_updated": "2025-01-01",
        "version": "3.0 - DM 15/2024"
    },
    
    {
        "name": "Dichiarazione di Conformità DM 37/08",
        "description": "Dichiarazione di conformità dell'impianto secondo DM 37/08",
        "category": DocumentCategoryEnum.TECNICO,
        "template_type": "pdf",
        "uso": "Installation Certification",
        "variables": {
            # Dati installatore
            "installatore_ragione_sociale": {"type": "string", "source": "plant.registry.installer_company_name"},
            "installatore_piva": {"type": "string", "source": "plant.registry.installer_company_vat"},
            "installatore_cciaa": {"type": "string", "source": "plant.registry.installer_chamber_commerce_reg"},
            "installatore_licenza": {"type": "string", "source": "plant.registry.installer_dm3708_license"},
            "resp_tecnico_nome": {"type": "string", "source": "plant.registry.installer_technical_manager"},
            "resp_tecnico_abilitazione": {"type": "string", "source": "plant.registry.installer_technical_manager_license"},
            
            # Ubicazione impianto
            "impianto_indirizzo": {"type": "string", "source": "plant.address"},
            "impianto_comune": {"type": "string", "source": "plant.municipality"},
            "impianto_provincia": {"type": "string", "source": "plant.province"},
            
            # Descrizione lavori
            "tipo_intervento": {"type": "string", "default": "Nuovo impianto"},
            "potenza_impegnata_kw": {"type": "number", "source": "plant.power_kw"},
            
            # Data e firma
            "data_fine_lavori": {"type": "date", "source": "workflow.tasks.completed_date"},
            "firma_installatore": {"type": "signature", "required": True}
        },
        "mandatory_attachments": [
            {
                "type": "progetto",
                "description": "Progetto timbrato e firmato da tecnico abilitato",
                "condizione": "potenza > 6 kW"
            },
            {
                "type": "schema",
                "description": "Schema impianto timbrato e firmato",
                "condizione": "sempre"
            },
            {
                "type": "relazione_materiali",
                "description": "Relazione con tipologia materiali",
                "condizione": "sempre"
            },
            {
                "type": "visura_cciaa",
                "description": "Certificato CCIAA aggiornato",
                "condizione": "sempre"
            }
        ],
        "official_template_url": "https://www.mise.gov.it/images/stories/normativa/DM_37_08_modello_dichiarazione_conformita.pdf",
        "portal_download_page": "https://www.mise.gov.it/index.php/it/normativa/decreti-ministeriali/2032968-decreto-ministeriale-22-gennaio-2008-n-37",
        "alternate_sources": [
            {"name": "Camera di Commercio", "url": "https://www.registroimprese.it/dichiarazione-di-conformita"}
        ],
        "last_updated": "2024-06-01",
        "version": "Allegato I - DM 37/2008"
    },
    
    {
        "name": "Regolamento di Esercizio E-Distribuzione",
        "description": "Regolamento di esercizio per connessione alla rete",
        "category": DocumentCategoryEnum.CONTRATTUALE,
        "template_type": "docx",
        "uso": "DSO Operating Agreement",
        "pre_filled_by": "E-Distribuzione",
        "variables": {
            # Sezione da completare
            "parametri_protezione": {
                "tensione_max": {"type": "number", "unit": "V"},
                "tensione_min": {"type": "number", "unit": "V"},
                "frequenza_max": {"type": "number", "unit": "Hz"},
                "frequenza_min": {"type": "number", "unit": "Hz"},
                "tempo_intervento": {"type": "number", "unit": "ms"}
            },
            "configurazione_neutro": {"type": "string", "options": ["TN", "TT", "IT"]},
            "responsabile_esercizio": {"type": "string", "source": "plant.registry.responsible"},
            "contatti_emergenza": {
                "telefono": {"type": "string", "source": "plant.registry.responsible_phone"},
                "email": {"type": "string", "source": "plant.registry.responsible_email"}
            }
        },
        "source": "Downloaded from DSO portal after TICA acceptance"
    },
    
    {
        "name": "Dichiarazione Consumo Annuale ADM",
        "description": "Dichiarazione annuale consumo energia per Agenzia Dogane",
        "category": DocumentCategoryEnum.FISCALE,
        "template_type": "xml",
        "uso": "Annual Customs Declaration",
        "variables": {
            # Dati officina elettrica
            "licenza_numero": {"type": "string", "source": "plant.registry.customs_workshop_license"},
            "anno_riferimento": {"type": "number", "source": "current_year - 1"},
            
            # Produzione mensile
            "produzione_mensile": {
                "type": "array",
                "items": {
                    "mese": {"type": "number", "min": 1, "max": 12},
                    "produzione_kwh": {"type": "number"},
                    "autoconsumo_kwh": {"type": "number"},
                    "immesso_rete_kwh": {"type": "number"}
                }
            },
            
            # Letture contatori fiscali
            "contatore_produzione": {
                "matricola": {"type": "string", "source": "plant.registry.fiscal_meter_serial"},
                "lettura_iniziale": {"type": "number"},
                "lettura_finale": {"type": "number"}
            }
        },
        "submission": {
            "portal": "PUDM",
            "deadline": "31 marzo",
            "format": "EDI",
            "method": "U2S web interface"
        }
    },
    
    {
        "name": "F24 Diritto Annuale Licenza",
        "description": "Modello F24 per pagamento diritto annuale officina elettrica",
        "category": DocumentCategoryEnum.FISCALE,
        "template_type": "pdf",
        "uso": "Annual License Fee Payment",
        "variables": {
            "codice_tributo": {"type": "string", "default": "2813"},
            "anno_riferimento": {"type": "number", "source": "current_year"},
            "importo": {"type": "number", "calculation": "based_on_power"},
            "codice_fiscale": {"type": "string", "source": "plant.registry.tax_code"}
        },
        "payment_deadline": {
            "start": "1 dicembre",
            "end": "16 dicembre"
        }
    },
    
    {
        "name": "Richiesta Certificato Digitale Terna",
        "description": "Modulo richiesta certificato digitale per impianti > 10MW",
        "category": DocumentCategoryEnum.AMMINISTRATIVO,
        "template_type": "pdf",
        "uso": "GAUDÌ Digital Certificate",
        "condition": "plant.power_kw > 10000",
        "variables": {
            "produttore_nome": {"type": "string", "source": "plant.registry.owner"},
            "produttore_cf_piva": {"type": "string", "source": "plant.registry.tax_code"},
            "impianto_denominazione": {"type": "string", "source": "plant.name"},
            "impianto_potenza_mw": {"type": "number", "source": "plant.power_kw / 1000"},
            "referente_tecnico": {"type": "string", "source": "plant.registry.responsible"}
        }
    },
    
    {
        "name": "Dichiarazione Antimafia GSE",
        "description": "Dichiarazione antimafia per incentivi GSE > 150.000€",
        "category": DocumentCategoryEnum.AMMINISTRATIVO,
        "template_type": "pdf",
        "uso": "GSE Antimafia Declaration",
        "variables": {
            "societa_denominazione": {"type": "string", "source": "plant.registry.owner"},
            "societa_cf_piva": {"type": "string", "source": "plant.registry.tax_code"},
            "soci_amministratori": {
                "type": "array",
                "items": {
                    "name": {"type": "string"},
                    "cf": {"type": "string"},
                    "carica": {"type": "string"}
                }
            },
            "familiari_conviventi": {
                "type": "array",
                "items": {
                    "name": {"type": "string"},
                    "cf": {"type": "string"},
                    "grado_parentela": {"type": "string"}
                }
            }
        },
        "recurrence": "annual",
        "submission": "GSE portal"
    },
    
    {
        "name": "Test Report SPI",
        "description": "Verbale di verifica Sistema Protezione Interfaccia",
        "category": DocumentCategoryEnum.TECNICO,
        "template_type": "pdf",
        "uso": "Interface Protection Test",
        "variables": {
            # Dati impianto e SPI
            "impianto_pod": {"type": "string", "source": "plant.registry.pod"},
            "spi_costruttore": {"type": "string", "source": "plant.registry.spi_manufacturer"},
            "spi_modello": {"type": "string", "source": "plant.registry.spi_model"},
            "spi_matricola": {"type": "string", "source": "plant.registry.spi_serial_number"},
            
            # Parametri taratura
            "taratura": {"type": "object", "source": "plant.registry.spi_calibration_parameters"},
            
            # Risultati test
            "test_results": {
                "type": "array",
                "items": {
                    "test_type": {"type": "string"},
                    "valore_taratura": {"type": "number"},
                    "tempo_intervento": {"type": "number"},
                    "esito": {"type": "string", "options": ["PASS", "FAIL"]}
                }
            },
            
            # Tecnico verificatore
            "tecnico_nome": {"type": "string"},
            "tecnico_abilitazione": {"type": "string"},
            "data_verifica": {"type": "date"}
        }
    }
]

# Helper functions for document generation
def get_template_by_name(name: str) -> dict:
    """Get document template by name"""
    for template in DOCUMENT_TEMPLATES:
        if template["name"] == name:
            return template
    return None

def get_templates_for_workflow(workflow_type: str) -> list:
    """Get all templates needed for a specific workflow type"""
    templates = []
    for template in DOCUMENT_TEMPLATES:
        if workflow_type in template.get("uso", ""):
            templates.append(template)
    return templates

def calculate_f24_amount(power_kw: float) -> float:
    """Calculate F24 annual fee based on plant power"""
    if power_kw <= 100:
        return 23.24
    elif power_kw <= 500:
        return 58.10
    elif power_kw <= 1000:
        return 116.20
    else:
        return 232.41