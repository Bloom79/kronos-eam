"""
PDF Form Generation Service

Generates pre-filled PDF forms for Italian energy sector portals.
Supports GSE, Terna, E-Distribuzione, and Dogane form templates.
"""

import os
import tempfile
import io
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from PyPDF2 import PdfReader, PdfWriter
from PyPDF2.generic import BooleanObject, NameObject, IndirectObject

from app.models.plant import Plant
from app.schemas.smart_assistant import PortalType, FormType, SubmissionPackage


class PDFFormGenerator:
    """
    Generates pre-filled PDF forms for energy sector portals
    """
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        
    def setup_custom_styles(self):
        """Setup custom paragraph styles for forms"""
        self.styles.add(ParagraphStyle(
            name='FormTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='FormSection',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=10,
            spaceBefore=15,
            textColor=colors.darkgreen
        ))
        
        self.styles.add(ParagraphStyle(
            name='FormField',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=5,
            leftIndent=10
        ))
    
    def _get_anagrafica_field(self, plant: Plant, field: str, default: str = 'DA SPECIFICARE') -> str:
        """Safely get anagrafica field with fallback"""
        if plant.anagrafica and hasattr(plant.anagrafica, field):
            value = getattr(plant.anagrafica, field)
            return value if value else default
        # Try to get from plant directly if field exists there
        if hasattr(plant, field):
            value = getattr(plant, field)
            return value if value else default
        return default
    
    async def generate_gse_rid_form(self, plant: Plant) -> bytes:
        """
        Generate GSE RID (Ritiro Dedicato) application form
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm)
        
        story = []
        
        # Header
        story.append(Paragraph(
            "Domanda di Accesso al Regime di Ritiro Dedicato (RID)",
            self.styles['FormTitle']
        ))
        story.append(Spacer(1, 20))
        
        # Plant identification section
        story.append(Paragraph("1. IDENTIFICAZIONE DELL'IMPIANTO", self.styles['FormSection']))
        
        # Get potenza value safely
        potenza = getattr(plant, 'potenza_installata', None) or getattr(plant, 'potenza_kw', 0)
        
        plant_data = [
            ['Codice CENSIMP:', self._get_anagrafica_field(plant, 'codice_censimp', 'DA ASSEGNARE')],
            ['Denominazione Plant:', plant.nome],
            ['Potenza Installata (kW):', f"{potenza:.2f}" if potenza else 'DA SPECIFICARE'],
            ['Comune di Installazione:', self._get_anagrafica_field(plant, 'comune')],
            ['Provincia:', self._get_anagrafica_field(plant, 'provincia')],
            ['Regione:', self._get_anagrafica_field(plant, 'regione')],
            ['Codice POD:', self._get_anagrafica_field(plant, 'codice_pod', 'DA VERIFICARE')],
        ]
        
        for label, value in plant_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Producer section
        story.append(Paragraph("2. DATI DEL PRODUTTORE", self.styles['FormSection']))
        
        # Build address safely
        indirizzo = self._get_anagrafica_field(plant, 'indirizzo')
        comune = self._get_anagrafica_field(plant, 'comune')
        full_address = f"{indirizzo}, {comune}" if indirizzo != 'DA SPECIFICARE' and comune != 'DA SPECIFICARE' else 'DA SPECIFICARE'
        
        producer_data = [
            ['Ragione Sociale:', self._get_anagrafica_field(plant, 'proprietario')],
            ['Codice Fiscale/P.IVA:', self._get_anagrafica_field(plant, 'codice_fiscale')],
            ['Indirizzo:', full_address],
            ['PEC:', self._get_anagrafica_field(plant, 'pec')],
            ['Telefono:', self._get_anagrafica_field(plant, 'telefono')],
        ]
        
        for label, value in producer_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Technical data section
        story.append(Paragraph("3. DATI TECNICI", self.styles['FormSection']))
        
        # Get date safely
        data_attivazione_str = 'DA SPECIFICARE'
        if hasattr(plant, 'data_attivazione') and plant.data_attivazione:
            data_attivazione_str = plant.data_attivazione.strftime('%d/%m/%Y')
        
        technical_data = [
            ['Tecnologia:', self._get_anagrafica_field(plant, 'tecnologia', 'Fotovoltaico')],
            ['Data Entrata in Esercizio:', data_attivazione_str],
            ['Tensione di Connessione:', self._get_anagrafica_field(plant, 'tensione_connessione')],
            ['Tipo di Allacciamento:', self._get_anagrafica_field(plant, 'tipo_allacciamento')],
        ]
        
        for label, value in technical_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 20))
        
        # Declaration
        story.append(Paragraph("4. DICHIARAZIONI", self.styles['FormSection']))
        story.append(Paragraph(
            "Il sottoscritto dichiara di essere a conoscenza delle disposizioni "
            "del D.Lgs. 387/2003 e successive modifiche, del D.M. 6 luglio 2012 e "
            "delle Procedure Tecniche del GSE per l'accesso al Ritiro Dedicato.",
            self.styles['FormField']
        ))
        
        story.append(Spacer(1, 30))
        
        # Signature section
        signature_table = [
            ['Data: _______________', 'Firma: _______________________']
        ]
        
        t = Table(signature_table, colWidths=[8*cm, 8*cm])
        t.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        story.append(t)
        
        # Footer
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            f"Documento generato automaticamente da Kronos EAM - {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            self.styles['Normal']
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    async def generate_terna_gaudi_form(self, plant: Plant) -> bytes:
        """
        Generate Terna GAUDÌ plant registration form
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm)
        
        story = []
        
        # Header
        story.append(Paragraph(
            "Registrazione Plant di Produzione - Sistema GAUDÌ",
            self.styles['FormTitle']
        ))
        story.append(Spacer(1, 20))
        
        # CENSIMP section
        story.append(Paragraph("1. CODICE CENSIMP", self.styles['FormSection']))
        story.append(Paragraph(
            f"<b>Codice CENSIMP:</b> {plant.anagrafica.codice_censimp or 'DA RICHIEDERE A TERNA'}",
            self.styles['FormField']
        ))
        
        story.append(Spacer(1, 15))
        
        # Plant data
        story.append(Paragraph("2. ANAGRAFICA IMPIANTO", self.styles['FormSection']))
        
        terna_data = [
            ['Denominazione:', plant.nome],
            ['Comune:', plant.anagrafica.comune],
            ['Provincia:', plant.anagrafica.provincia],
            ['Coordinate GPS Lat:', plant.anagrafica.latitudine or 'DA RILEVARE'],
            ['Coordinate GPS Lon:', plant.anagrafica.longitudine or 'DA RILEVARE'],
            ['Potenza Efficiente Lorda (MW):', f"{plant.potenza_installata/1000:.3f}"],
            ['Tensione Nominale (kV):', plant.anagrafica.tensione_connessione or 'DA SPECIFICARE'],
        ]
        
        for label, value in terna_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Connection data
        story.append(Paragraph("3. DATI DI CONNESSIONE", self.styles['FormSection']))
        
        connection_data = [
            ['Punto di Connessione:', plant.anagrafica.punto_connessione or 'DA SPECIFICARE'],
            ['Gestore di Rete:', plant.anagrafica.gestore_rete or 'E-Distribuzione'],
            ['Codice Pratica Connessione:', plant.anagrafica.codice_pratica or 'DA SPECIFICARE'],
            ['Data Richiesta Connessione:', 'DA SPECIFICARE'],
            ['Data Autorizzazione:', 'DA SPECIFICARE'],
        ]
        
        for label, value in connection_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Technical specifications
        story.append(Paragraph("4. SPECIFICHE TECNICHE", self.styles['FormSection']))
        
        tech_specs = [
            ['Tecnologia:', plant.anagrafica.tecnologia or 'Fotovoltaico'],
            ['Numero Unità di Produzione:', '1'],
            ['Tipo Combustibile:', 'Fonte Rinnovabile (Sole)'],
            ['Regime di Incentivazione:', 'DA SPECIFICARE'],
            ['Qualifica IAFR:', 'DA RICHIEDERE'],
        ]
        
        for label, value in tech_specs:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 30))
        
        # Note
        story.append(Paragraph("NOTE", self.styles['FormSection']))
        story.append(Paragraph(
            "Questo modulo deve essere compilato e inviato tramite il portale GAUDÌ di Terna. "
            "È necessario autenticarsi con certificato digitale CNS o CIE.",
            self.styles['FormField']
        ))
        
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            f"Documento preparato da Kronos EAM - {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            self.styles['Normal']
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    async def generate_dso_tica_request(self, plant: Plant) -> bytes:
        """
        Generate DSO TICA (connection cost estimate) request
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm)
        
        story = []
        
        # Header
        story.append(Paragraph(
            "Richiesta TICA - Preventivo per Connessione Plant",
            self.styles['FormTitle']
        ))
        story.append(Spacer(1, 20))
        
        # Applicant data
        story.append(Paragraph("1. DATI DEL RICHIEDENTE", self.styles['FormSection']))
        
        applicant_data = [
            ['Ragione Sociale:', plant.anagrafica.proprietario or 'DA SPECIFICARE'],
            ['Codice Fiscale/P.IVA:', plant.anagrafica.codice_fiscale or 'DA SPECIFICARE'],
            ['Indirizzo Sede Legale:', f"{plant.anagrafica.indirizzo}, {plant.anagrafica.comune}"],
            ['PEC:', plant.anagrafica.pec or 'DA SPECIFICARE'],
            ['Telefono:', plant.anagrafica.telefono or 'DA SPECIFICARE'],
            ['Referente Tecnico:', 'DA SPECIFICARE'],
        ]
        
        for label, value in applicant_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Installation data
        story.append(Paragraph("2. DATI DELL'INSTALLAZIONE", self.styles['FormSection']))
        
        installation_data = [
            ['Indirizzo Installazione:', f"{plant.anagrafica.indirizzo}, {plant.anagrafica.comune}"],
            ['Potenza da Installare (kW):', f"{plant.potenza_installata:.2f}"],
            ['Tecnologia:', plant.anagrafica.tecnologia or 'Fotovoltaico'],
            ['Tipo di Connessione:', 'Immissione + Prelievo'],
            ['Tensione Richiesta:', plant.anagrafica.tensione_connessione or '0.4 kV (BT)'],
        ]
        
        for label, value in installation_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Point of delivery
        story.append(Paragraph("3. PUNTO DI PRELIEVO ESISTENTE", self.styles['FormSection']))
        
        pod_data = [
            ['Codice POD:', plant.anagrafica.codice_pod or 'NON PRESENTE'],
            ['Potenza Disponibile (kW):', 'DA VERIFICARE'],
            ['Tipo Fornitura:', 'DA VERIFICARE'],
            ['Tensione Fornitura:', 'DA VERIFICARE'],
        ]
        
        for label, value in pod_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Technical requirements
        story.append(Paragraph("4. REQUISITI TECNICI", self.styles['FormSection']))
        
        tech_req = [
            ['Protezione di Interfaccia:', 'Conforme CEI 0-21'],
            ['Sistema di Misura:', 'Bidirezionale'],
            ['Modalità di Scambio:', 'Scambio sul Posto / Ritiro Dedicato'],
            ['Data Prevista Entrata Esercizio:', 'DA SPECIFICARE'],
        ]
        
        for label, value in tech_req:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 20))
        
        # Documents checklist
        story.append(Paragraph("5. DOCUMENTAZIONE ALLEGATA", self.styles['FormSection']))
        
        docs_checklist = [
            '□ Visura camerale (se società)',
            '□ Documento di identità del legale rappresentante',
            '□ Planimetria catastale del sito',
            '□ Schema elettrico unifilare preliminare',
            '□ Relazione tecnica preliminare',
            '□ Autorizzazioni/permessi edilizi (se disponibili)',
        ]
        
        for doc in docs_checklist:
            story.append(Paragraph(doc, self.styles['FormField']))
        
        story.append(Spacer(1, 30))
        
        # Footer
        story.append(Paragraph(
            f"Documento preparato da Kronos EAM - {datetime.now().strftime('%d/%m/%Y %H:%M')}<br/>"
            "Da inviare tramite portale E-Distribuzione (www.e-distribuzione.it)",
            self.styles['Normal']
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    async def generate_dogane_utf_declaration(self, plant: Plant, annual_production: float) -> bytes:
        """
        Generate UTF (Unique Tax Form) annual declaration for Dogane
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm)
        
        story = []
        
        # Header
        story.append(Paragraph(
            "Dichiarazione Annuale UTF - Produzione Energia Elettrica",
            self.styles['FormTitle']
        ))
        story.append(Spacer(1, 20))
        
        # Reference year
        current_year = datetime.now().year - 1  # Previous year
        story.append(Paragraph(
            f"<b>Anno di Riferimento:</b> {current_year}",
            self.styles['FormSection']
        ))
        
        story.append(Spacer(1, 15))
        
        # Operator data
        story.append(Paragraph("1. DATI DELL'ESERCENTE", self.styles['FormSection']))
        
        operator_data = [
            ['Ragione Sociale:', plant.anagrafica.proprietario or 'DA SPECIFICARE'],
            ['Codice Fiscale:', plant.anagrafica.codice_fiscale or 'DA SPECIFICARE'],
            ['Numero Licenza UTF:', 'DA SPECIFICARE'],
            ['Codice Officina:', plant.anagrafica.codice_officina or 'DA RICHIEDERE'],
        ]
        
        for label, value in operator_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Plant data
        story.append(Paragraph("2. DATI DELL'IMPIANTO", self.styles['FormSection']))
        
        plant_data = [
            ['Denominazione:', plant.nome],
            ['Ubicazione:', f"{plant.anagrafica.indirizzo}, {plant.anagrafica.comune} ({plant.anagrafica.provincia})"],
            ['Potenza Installata (kW):', f"{plant.potenza_installata:.2f}"],
            ['Data Attivazione:', plant.data_attivazione.strftime('%d/%m/%Y') if plant.data_attivazione else 'DA SPECIFICARE'],
            ['Tipo Plant:', 'Fotovoltaico'],
        ]
        
        for label, value in plant_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Production data
        story.append(Paragraph("3. DATI DI PRODUZIONE", self.styles['FormSection']))
        
        # Calculate fees (€0.0125 per MWh for plants > 20 kW)
        production_mwh = annual_production / 1000
        fee_due = production_mwh * 0.0125 if plant.potenza_installata > 20 else 0
        
        production_data = [
            ['Energia Prodotta (kWh):', f"{annual_production:,.0f}"],
            ['Energia Prodotta (MWh):', f"{production_mwh:,.3f}"],
            ['Tariffa UTF (€/MWh):', '0.0125' if plant.potenza_installata > 20 else '0.0000'],
            ['Tributo Dovuto (€):', f"{fee_due:.2f}"],
        ]
        
        for label, value in production_data:
            story.append(Paragraph(
                f"<b>{label}</b> {value}",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 15))
        
        # Exemption note for small plants
        if plant.potenza_installata <= 20:
            story.append(Paragraph("4. ESENZIONE", self.styles['FormSection']))
            story.append(Paragraph(
                "L'impianto risulta esente dal pagamento del tributo UTF in quanto "
                "la potenza installata è inferiore o uguale a 20 kW "
                "(art. 52 del D.Lgs. 504/1995).",
                self.styles['FormField']
            ))
        
        story.append(Spacer(1, 20))
        
        # Instructions
        story.append(Paragraph("MODALITÀ DI INVIO", self.styles['FormSection']))
        story.append(Paragraph(
            "La dichiarazione deve essere trasmessa entro il 31 marzo tramite:<br/>"
            "• Portale Dogane (SPID/CIE/CNS)<br/>"
            "• Software desktop Agenzia Dogane<br/>"
            "• File EDI in formato XML",
            self.styles['FormField']
        ))
        
        story.append(Spacer(1, 30))
        
        # Footer
        story.append(Paragraph(
            f"Documento preparato da Kronos EAM - {datetime.now().strftime('%d/%m/%Y %H:%M')}<br/>"
            "Verificare sempre i dati prima dell'invio ufficiale",
            self.styles['Normal']
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    async def generate_form_by_type(
        self, 
        portal: PortalType, 
        form_type: FormType, 
        plant: Plant,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Generate form based on portal and form type
        """
        if portal == PortalType.GSE:
            if form_type == FormType.RID_APPLICATION:
                return await self.generate_gse_rid_form(plant)
            elif form_type == FormType.SSP_APPLICATION:
                # Similar to RID but for SSP
                return await self.generate_gse_rid_form(plant)  # Placeholder
        
        elif portal == PortalType.TERNA:
            if form_type == FormType.PLANT_REGISTRATION:
                return await self.generate_terna_gaudi_form(plant)
        
        elif portal == PortalType.DSO:
            if form_type == FormType.TICA_REQUEST:
                return await self.generate_dso_tica_request(plant)
        
        elif portal == PortalType.DOGANE:
            if form_type == FormType.UTF_DECLARATION:
                annual_production = additional_data.get('annual_production', 0) if additional_data else 0
                return await self.generate_dogane_utf_declaration(plant, annual_production)
        
        raise ValueError(f"Unsupported form type {form_type} for portal {portal}")
    
    def _create_table_from_data(self, data: List[Tuple[str, str]]) -> Table:
        """Helper method to create formatted tables"""
        table = Table(data, colWidths=[6*cm, 10*cm])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ]))
        return table