import React, { useState } from 'react';
import { 
  Bot, 
  Upload, 
  FileText, 
  Send, 
  Mic, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Brain,
  FileSearch,
  MessageSquare,
  Zap,
  BarChart3,
  Calendar,
  Euro,
  Building,
  Shield,
  Link2,
  Eye,
  Copy,
  RefreshCw,
  Settings,
  ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

interface Document {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Excel' | 'Word' | 'XML';
  dimensione: string;
  dataCaricamento: string;
  status: 'In Elaborazione' | 'Completato' | 'Errore';
  pagineTotali?: number;
  pagineElaborate?: number;
  campiEstratti?: number;
}

interface ExtractedField {
  name: string;
  valore: string;
  confidenza: number;
  pagina?: number;
  categoria: 'registry' | 'Economico' | 'Tecnico' | 'Temporale' | 'Normativo';
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  contenuto: string;
  timestamp: string;
  documento?: string;
  suggerimenti?: string[];
}

const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extraction' | 'chat'>('extraction');
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'TICA_SolareVerdi_2024.pdf',
      type: 'PDF',
      dimensione: '2.4 MB',
      dataCaricamento: '2024-03-15 14:30:00',
      status: 'Completato',
      pagineTotali: 24,
      pagineElaborate: 24,
      campiEstratti: 47
    },
    {
      id: '2',
      name: 'Fattura_GSE_Marzo_2024.pdf',
      type: 'PDF',
      dimensione: '856 KB',
      dataCaricamento: '2024-03-15 14:25:00',
      status: 'In Elaborazione',
      pagineTotali: 8,
      pagineElaborate: 5
    },
    {
      id: '3',
      name: 'Dichiarazione_Antimafia_2024.pdf',
      type: 'PDF',
      dimensione: '1.2 MB',
      dataCaricamento: '2024-03-15 14:20:00',
      status: 'Errore'
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(documents[0]);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([
    // registry
    { name: 'Codice Pratica', valore: 'T2024/BR/00123', confidenza: 0.98, pagina: 1, categoria: 'registry' },
    { name: 'Ragione Sociale', valore: 'Solare Verdi S.r.l.', confidenza: 0.99, pagina: 1, categoria: 'registry' },
    { name: 'Partita IVA', valore: '12345678901', confidenza: 0.97, pagina: 1, categoria: 'registry' },
    { name: 'Codice POD', valore: 'IT001E12345678', confidenza: 0.96, pagina: 2, categoria: 'registry' },
    
    // Tecnico
    { name: 'Potenza Richiesta', valore: '999.9 kW', confidenza: 0.95, pagina: 3, categoria: 'Tecnico' },
    { name: 'Tensione Connessione', valore: '20 kV', confidenza: 0.94, pagina: 3, categoria: 'Tecnico' },
    { name: 'type Connessione', valore: 'Trifase MT', confidenza: 0.93, pagina: 3, categoria: 'Tecnico' },
    { name: 'Cabina Primaria', valore: 'CP Brindisi Nord', confidenza: 0.92, pagina: 4, categoria: 'Tecnico' },
    
    // Economico
    { name: 'Corrispettivo Connessione', valore: '€ 45.678,90', confidenza: 0.96, pagina: 5, categoria: 'Economico' },
    { name: 'Oneri di Rete', valore: '€ 12.345,67', confidenza: 0.95, pagina: 5, categoria: 'Economico' },
    { name: 'IVA', valore: '€ 12.804,43', confidenza: 0.97, pagina: 5, categoria: 'Economico' },
    { name: 'Totale', valore: '€ 70.829,00', confidenza: 0.98, pagina: 5, categoria: 'Economico' },
    
    // Temporale
    { name: 'Data Richiesta', valore: '15/01/2024', confidenza: 0.94, pagina: 1, categoria: 'Temporale' },
    { name: 'Data Preventivo', valore: '14/02/2024', confidenza: 0.95, pagina: 1, categoria: 'Temporale' },
    { name: 'Validità Preventivo', valore: '120 giorni', confidenza: 0.93, pagina: 6, categoria: 'Temporale' },
    { name: 'Tempo Realizzazione', valore: '180 giorni', confidenza: 0.92, pagina: 7, categoria: 'Temporale' }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      contenuto: 'Ciao! Sono il tuo assistente AI specializzato in documenti energetici. Posso aiutarti con l\'estrazione dati, analisi documenti e rispondere alle tue domande. Come posso assisterti oggi?',
      timestamp: '14:30:00',
      suggerimenti: [
        'Analizza l\'ultimo TICA caricato',
        'Quali sono le scadenze di questo mese?',
        'Mostra lo status delle pratiche GSE',
        'Genera report compliance'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);

  const documentTemplates = [
    { type: 'TICA', campi: 12, icon: Link2, color: 'purple' },
    { type: 'Fattura GSE', campi: 8, icon: Euro, color: 'blue' },
    { type: 'GAUDÌ', campi: 15, icon: Shield, color: 'green' },
    { type: 'Antimafia', campi: 10, icon: FileText, color: 'yellow' },
    { type: 'Licenza UTF', campi: 14, icon: Building, color: 'red' }
  ];

  const extractionStats = {
    documentiProcessati: 142,
    campiEstratti: 3456,
    accuratezzaMedia: 0.94,
    tempoMedioMs: 2300
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completato':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'In Elaborazione':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'Errore':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'registry':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Economico':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Tecnico':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'Temporale':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Normativo':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.8) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredFields = extractedFields.filter(field => field.confidenza >= confidenceThreshold);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        contenuto: inputMessage,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setInputMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          contenuto: 'Ho analizzato la tua richiesta. Basandomi sui documenti caricati, posso confermare che il preventivo TICA per Solare Verdi ha un corrispettivo di connessione di €45.678,90 con validità di 120 giorni dalla data di emissione (14/02/2024).',
          timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          documento: 'TICA_SolareVerdi_2024.pdf'
        };
        setChatMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Assistente AI
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Estrazione intelligente dati e assistenza conversazionale
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configura
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('extraction')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              activeTab === 'extraction'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <FileSearch className="h-5 w-5" />
            Estrazione Documenti
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
              activeTab === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <MessageSquare className="h-5 w-5" />
            Chat Assistente
          </button>
        </div>
      </div>

      {/* Document Extraction Tab */}
      {activeTab === 'extraction' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Upload/List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Carica Documenti
              </h3>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Trascina qui i documenti o clicca per selezionarli
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PDF, Immagini, Excel, Word, XML (max 50MB)
                </p>
              </div>
            </div>

            {/* Document List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Documenti Recenti
              </h3>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={clsx(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedDocument?.id === doc.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {doc.dimensione} • {new Date(doc.dataCaricamento).toLocaleString('it-IT')}
                          </p>
                          {doc.status === 'In Elaborazione' && doc.pagineTotali && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Elaborazione
                                </span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {doc.pagineElaborate}/{doc.pagineTotali} pagine
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${(doc.pagineElaborate! / doc.pagineTotali!) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(doc.status)
                      )}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.campiEstratti && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Sparkles className="h-3 w-3" />
                        <span>{doc.campiEstratti} campi estratti</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Template Disponibili
              </h3>
              <div className="space-y-2">
                {documentTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div key={template.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'p-2 rounded-lg',
                          template.color === 'purple' && 'bg-purple-100 dark:bg-purple-900',
                          template.color === 'blue' && 'bg-blue-100 dark:bg-blue-900',
                          template.color === 'green' && 'bg-green-100 dark:bg-green-900',
                          template.color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900',
                          template.color === 'red' && 'bg-red-100 dark:bg-red-900'
                        )}>
                          <Icon className={clsx(
                            'h-4 w-4',
                            template.color === 'purple' && 'text-purple-600 dark:text-purple-400',
                            template.color === 'blue' && 'text-blue-600 dark:text-blue-400',
                            template.color === 'green' && 'text-green-600 dark:text-green-400',
                            template.color === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
                            template.color === 'red' && 'text-red-600 dark:text-red-400'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            {template.type}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {template.campi} campi
                          </p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDocument && selectedDocument.status === 'Completato' && (
              <>
                {/* Extraction Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Dati Estratti - {selectedDocument.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {filteredFields.length} campi estratti con confidenza ≥ {(confidenceThreshold * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Settings className="h-4 w-4" />
                        Filtri
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4" />
                        Esporta
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Soglia Confidenza: {(confidenceThreshold * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={confidenceThreshold * 100}
                        onChange={(e) => setConfidenceThreshold(Number(e.target.value) / 100)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Extracted Fields Grid */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFields.map((field, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {field.name}
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-1">
                              {field.valore}
                            </p>
                          </div>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ml-2">
                            <Copy className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <span className={clsx(
                              'px-2 py-1 rounded text-xs font-medium',
                              getCategoriaColor(field.categoria)
                            )}>
                              {field.categoria}
                            </span>
                            {field.pagina && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Pag. {field.pagina}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className={clsx('h-3 w-3', getConfidenceColor(field.confidenza))} />
                            <span className={clsx('text-xs font-medium', getConfidenceColor(field.confidenza))}>
                              {(field.confidenza * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-4">
                    Azioni Suggerite
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            Crea Scadenze
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Genera promemoria automatici
                          </p>
                        </div>
                      </div>
                    </button>
                    <button className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            Avvia Workflow
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Attiva processo automatico
                          </p>
                        </div>
                      </div>
                    </button>
                    <button className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div className="text-left">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            Aggiorna Sistema
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Sincronizza con database
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!selectedDocument && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                <FileSearch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                  Seleziona un documento
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Carica o seleziona un documento dalla lista per visualizzare i dati estratti
                </p>
              </div>
            )}

            {/* Processing State */}
            {selectedDocument && selectedDocument.status === 'In Elaborazione' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                <div className="animate-pulse">
                  <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">
                  Elaborazione in corso
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  L'AI sta analizzando il documento e estraendo i dati rilevanti...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        Assistente Kronos AI
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Online • Specializzato in documenti energetici
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={clsx(
                      'flex',
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={clsx(
                      'max-w-[70%] rounded-lg p-4',
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                    )}>
                      <p className="text-sm">{message.contenuto}</p>
                      {message.documento && (
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                          <FileText className="h-3 w-3" />
                          <span>{message.documento}</span>
                        </div>
                      )}
                      <p className={clsx(
                        'text-xs mt-2',
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      )}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Suggestions */}
                {chatMessages[chatMessages.length - 1]?.suggerimenti && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Suggerimenti:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chatMessages[chatMessages.length - 1].suggerimenti!.map((suggerimento, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputMessage(suggerimento)}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          {suggerimento}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsListening(!isListening)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      isListening
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Capabilities */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Capacità AI
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileSearch className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      Analisi Documenti
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Estrazione automatica dati da PDF e immagini
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      Compliance Check
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Verifica conformità normativa automatica
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      Gestione Scadenze
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Identificazione e promemoria automatici
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                      Analisi Predittiva
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Previsioni basate su dati storici
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Statistiche AI
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Documenti Processati
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {extractionStats.documentiProcessati}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '71%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Campi Estratti
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {extractionStats.campiEstratti.toLocaleString('it-IT')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '86%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Accuratezza Media
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {(extractionStats.accuratezzaMedia * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tempo Medio
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {(extractionStats.tempoMedioMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Azioni Rapide
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm text-left">
                  Genera Report Mensile
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm text-left">
                  Verifica Compliance
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm text-left">
                  Analizza Scadenze
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm text-left">
                  Esporta Dati
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;