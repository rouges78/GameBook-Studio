import React, { useState } from 'react';
import { buttonClasses } from '../utils/buttonStyles';
import { ArrowLeft, Book, Video, MessageCircle, Mail, X } from 'lucide-react';

interface HelpProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help') => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

interface Documentation {
  title: string;
  sections: {
    title: string;
    content: string[];
  }[];
}

interface FAQ {
  question: string;
  answer: string;
}

const documentation: Record<'en' | 'it', Documentation> = {
  en: {
    title: "Gamebook Studio Documentation",
    sections: [
      {
        title: "Getting Started",
        content: [
          "Welcome to Gamebook Studio! This powerful tool allows you to create interactive gamebooks with branching narratives.",
          "To begin, create a new project from the dashboard or open an existing one from your library.",
          "Each project consists of interconnected paragraphs that form your story's structure."
        ]
      },
      {
        title: "Creating Paragraphs",
        content: [
          "Click 'Add Paragraph' to create a new story segment",
          "Each paragraph can be one of three types:",
          "• Normal: Standard story segments",
          "• Node: Key decision points",
          "• Final: Story endings",
          "Use the rich text editor to format your content with bold, italic, headings, and more."
        ]
      },
      {
        title: "Managing Connections",
        content: [
          "Create choices by adding actions in the Multiple Actions box",
          "Each action needs descriptive text and a target paragraph number",
          "Use the Story Map to visualize and manage your story's structure",
          "The Story Map allows you to see all connections and reorganize your narrative"
        ]
      },
      {
        title: "Working with Images",
        content: [
          "Add images to paragraphs using the image editor",
          "Images can be positioned before or after paragraph text",
          "Supported formats: PNG, JPG, GIF",
          "Images are automatically optimized for web delivery"
        ]
      },
      {
        title: "Exporting Your Story",
        content: [
          "Export your gamebook in multiple formats:",
          "• PDF for print publishing",
          "• HTML for web publishing",
          "• DOCX for word processing",
          "• JSON for data backup",
          "Choose export settings like page size, margins, and formatting"
        ]
      }
    ]
  },
  it: {
    title: "Documentazione Gamebook Studio",
    sections: [
      {
        title: "Per Iniziare",
        content: [
          "Benvenuto in Gamebook Studio! Questo potente strumento ti permette di creare libri-gioco interattivi con narrative ramificate.",
          "Per iniziare, crea un nuovo progetto dalla dashboard o apri un progetto esistente dalla tua libreria.",
          "Ogni progetto è costituito da paragrafi interconnessi che formano la struttura della tua storia."
        ]
      },
      {
        title: "Creazione dei Paragrafi",
        content: [
          "Clicca su 'Aggiungi Paragrafo' per creare un nuovo segmento della storia",
          "Ogni paragrafo può essere di tre tipi:",
          "• Normale: Segmenti standard della storia",
          "• Nodo: Punti chiave di decisione",
          "• Finale: Conclusioni della storia",
          "Usa l'editor di testo ricco per formattare il contenuto con grassetto, corsivo, titoli e altro."
        ]
      },
      {
        title: "Gestione delle Connessioni",
        content: [
          "Crea scelte aggiungendo azioni nel box Azioni Multiple",
          "Ogni azione necessita di un testo descrittivo e un numero di paragrafo di destinazione",
          "Usa la Mappa della Storia per visualizzare e gestire la struttura della tua storia",
          "La Mappa della Storia permette di vedere tutte le connessioni e riorganizzare la narrativa"
        ]
      },
      {
        title: "Lavorare con le Immagini",
        content: [
          "Aggiungi immagini ai paragrafi usando l'editor di immagini",
          "Le immagini possono essere posizionate prima o dopo il testo del paragrafo",
          "Formati supportati: PNG, JPG, GIF",
          "Le immagini vengono automaticamente ottimizzate per il web"
        ]
      },
      {
        title: "Esportare la Tua Storia",
        content: [
          "Esporta il tuo libro-gioco in diversi formati:",
          "• PDF per la pubblicazione stampata",
          "• HTML per la pubblicazione web",
          "• DOCX per l'elaborazione testi",
          "• JSON per il backup dei dati",
          "Scegli le impostazioni di esportazione come dimensione pagina, margini e formattazione"
        ]
      }
    ]
  }
};

const faqs: Record<'en' | 'it', FAQ[]> = {
  en: [
    {
      question: "How do I start a new project?",
      answer: "Click the 'Create New Project' button on the dashboard. Fill in the book title, author name, and optionally upload a cover image. Then click 'Create Project' to begin."
    },
    {
      question: "Can I change paragraph connections after creating them?",
      answer: "Yes! You can modify connections at any time by editing the paragraph's actions or using the Story Map to visualize and reorganize connections."
    },
    {
      question: "How do I add images to my paragraphs?",
      answer: "Select a paragraph and click the 'Add Image' button. Use the image editor to upload and position your image either before or after the paragraph text."
    },
    {
      question: "What's the difference between node and normal paragraphs?",
      answer: "Normal paragraphs are standard story segments, while nodes represent key decision points in your story. Final paragraphs are used for story endings."
    },
    {
      question: "How can I export my book?",
      answer: "Click the 'Export' button in the paragraph editor. Choose your preferred format (PDF, HTML, DOCX, etc.) and customize the export settings before generating the file."
    }
  ],
  it: [
    {
      question: "Come inizio un nuovo progetto?",
      answer: "Clicca sul pulsante 'Crea Nuovo Progetto' nella dashboard. Inserisci il titolo del libro, il nome dell'autore e opzionalmente carica un'immagine di copertina. Poi clicca su 'Crea Progetto' per iniziare."
    },
    {
      question: "Posso modificare le connessioni tra paragrafi dopo averle create?",
      answer: "Sì! Puoi modificare le connessioni in qualsiasi momento modificando le azioni del paragrafo o utilizzando la Mappa della Storia per visualizzare e riorganizzare le connessioni."
    },
    {
      question: "Come aggiungo immagini ai miei paragrafi?",
      answer: "Seleziona un paragrafo e clicca sul pulsante 'Aggiungi Immagine'. Usa l'editor di immagini per caricare e posizionare la tua immagine prima o dopo il testo del paragrafo."
    },
    {
      question: "Qual è la differenza tra paragrafi nodo e normali?",
      answer: "I paragrafi normali sono segmenti standard della storia, mentre i nodi rappresentano punti chiave di decisione nella tua storia. I paragrafi finali sono usati per le conclusioni della storia."
    },
    {
      question: "Come posso esportare il mio libro?",
      answer: "Clicca sul pulsante 'Esporta' nell'editor dei paragrafi. Scegli il formato preferito (PDF, HTML, DOCX, ecc.) e personalizza le impostazioni di esportazione prima di generare il file."
    }
  ]
};

const Help: React.FC<HelpProps> = ({ setCurrentPage, isDarkMode, language }) => {
  const [showDocs, setShowDocs] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const translations = {
    it: {
      backToDashboard: "Torna alla Dashboard",
      help: "Aiuto",
      documentation: "Documentazione",
      viewDocumentation: "Visualizza documentazione",
      videoTutorials: "Video tutorial",
      watchTutorials: "Guarda i tutorial",
      faq: "Domande frequenti",
      viewFaq: "Visualizza FAQ",
      contactSupport: "Contatta il supporto",
      sendEmail: "Invia email",
      close: "Chiudi"
    },
    en: {
      backToDashboard: "Back to Dashboard",
      help: "Help",
      documentation: "Documentation",
      viewDocumentation: "View documentation",
      videoTutorials: "Video tutorials",
      watchTutorials: "Watch tutorials",
      faq: "Frequently Asked Questions",
      viewFaq: "View FAQ",
      contactSupport: "Contact Support",
      sendEmail: "Send email",
      close: "Close"
    }
  };

  const t = translations[language];
  const docs = documentation[language];
  const currentFaqs = faqs[language];

  return (
    <div className={`h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`mb-4 ${buttonClasses('blue')}`}
        >
          <ArrowLeft size={20} className="h-5 w-5" />
          <span>Torna alla Home</span>
        </button>
        <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-4 rounded-lg`}>{t.help}</h1>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Book size={24} className="mr-2" />
              {t.documentation}
            </h2>
            <p className="mb-4">Esplora la nostra documentazione completa per imparare a utilizzare tutte le funzionalità di Gamebook Studio.</p>
            <button 
              onClick={() => setShowDocs(true)}
              className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded`}
            >
              {t.viewDocumentation}
            </button>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Video size={24} className="mr-2" />
              {t.videoTutorials}
            </h2>
            <p className="mb-4">Guarda i nostri video tutorial per imparare rapidamente come utilizzare Gamebook Studio.</p>
            <button className={`${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-2 px-4 rounded`}>
              {t.watchTutorials}
            </button>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageCircle size={24} className="mr-2" />
              {t.faq}
            </h2>
            <p className="mb-4">Trova risposte alle domande più comuni su Gamebook Studio.</p>
            <button 
              onClick={() => setShowFaq(true)}
              className={`${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white font-bold py-2 px-4 rounded`}
            >
              {t.viewFaq}
            </button>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail size={24} className="mr-2" />
              {t.contactSupport}
            </h2>
            <p className="mb-4">Non hai trovato quello che cercavi? Contatta il nostro team di supporto.</p>
            <button className={`${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white font-bold py-2 px-4 rounded`}>
              {t.sendEmail}
            </button>
          </section>
        </div>
      </div>

      {/* Documentation Modal */}
      {showDocs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative`}>
            <button
              onClick={() => setShowDocs(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold mb-8">{docs.title}</h2>
            {docs.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="mb-2">{paragraph}</p>
                ))}
              </div>
            ))}
            <button
              onClick={() => setShowDocs(false)}
              className={`mt-4 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded`}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative`}>
            <button
              onClick={() => setShowFaq(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-3xl font-bold mb-8">{t.faq}</h2>
            {currentFaqs.map((faq, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{faq.answer}</p>
              </div>
            ))}
            <button
              onClick={() => setShowFaq(false)}
              className={`mt-4 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-2 px-4 rounded`}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
