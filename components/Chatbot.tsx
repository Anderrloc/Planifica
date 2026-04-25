
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Send, Upload, FileText, Bot, User, Loader2, X, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface Message {
  role: 'user' | 'bot';
  content: string;
}

const Chatbot: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false,
      });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item.str !== undefined ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (err: any) {
      console.error('PDF.js Error:', err);
      throw new Error(`Error al leer PDF: ${err.message || 'Error de formato o worker'}`);
    }
  };

  const extractTextFromWord = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      return result.value;
    } catch (err: any) {
      console.error('Mammoth Error:', err);
      throw new Error(`Error al leer Word: ${err.message || 'Archivo dañado o no soportado'}`);
    }
  };

  const extractTextFromExcel = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      let fullText = '';
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        fullText += `Hoja: ${sheetName}\n` + json.map((row: any) => row.join('\t')).join('\n') + '\n\n';
      });
      return fullText;
    } catch (err: any) {
      console.error('XLSX Error:', err);
      throw new Error(`Error al leer Excel: ${err.message || 'Archivo dañado o no soportado'}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessages([{ role: 'bot', content: '⚠️ **Archivo demasiado grande:** El límite es de 10MB para asegurar un procesamiento rápido.' }]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
    setIsExtracting(true);
    setMessages([]); // Clear previous chat when new file is uploaded
    
    try {
      let text = '';
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();

      if (fileType === 'pdf') {
        try {
          text = await extractTextFromPDF(selectedFile);
        } catch (pdfErr: any) {
          console.error('PDF Extraction Error:', pdfErr);
          throw new Error(`Error en PDF: ${pdfErr.message || 'Error desconocido'}`);
        }
      } else if (fileType === 'doc' || fileType === 'docx') {
        try {
          text = await extractTextFromWord(selectedFile);
        } catch (wordErr: any) {
          console.error('Word Extraction Error:', wordErr);
          throw new Error(`Error en Word: ${wordErr.message || 'Error desconocido'}`);
        }
      } else if (fileType === 'xls' || fileType === 'xlsx' || fileType === 'csv') {
        try {
          text = await extractTextFromExcel(selectedFile);
        } catch (excelErr: any) {
          console.error('Excel Extraction Error:', excelErr);
          throw new Error(`Error en Excel: ${excelErr.message || 'Error desconocido'}`);
        }
      } else {
        text = 'Formato de archivo no soportado.';
      }

      if (!text || text.trim().length === 0) {
        throw new Error('No se pudo extraer texto del archivo. ¿Está vacío o protegido?');
      }

      setExtractedText(text);
      setMessages([{ role: 'bot', content: `He procesado el archivo: **${selectedFile.name}**. ¿En qué puedo ayudarte con esta información?` }]);
    } catch (error: any) {
      console.error('Error extracting text:', error);
      setMessages([{ 
        role: 'bot', 
        content: `❌ **Error al procesar el archivo:** ${error.message}\n\nPor favor, asegúrate de que el archivo no esté dañado o protegido con contraseña.` 
      }]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{ text: `Contexto del documento:\n\n${extractedText.substring(0, 30000)}\n\nPregunta del usuario: ${userMessage}` }]
          }
        ],
        config: {
          systemInstruction: "Eres un asistente experto en análisis de documentos. Responde preguntas basadas únicamente en el contenido del documento proporcionado. Si la información no está en el documento, indícalo amablemente. Usa un tono profesional y servicial."
        }
      });

      const response = await model;
      const botResponse = response.text || 'No pude generar una respuesta.';
      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error: any) {
      console.error('Error generating response:', error);
      let errorMessage = 'Lo siento, ocurrió un error al procesar tu pregunta.';
      if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
        errorMessage = "❌ **Error de API:** Por favor, asegúrate de haber configurado tu API Key en el botón superior 'Configurar API'.";
      }
      setMessages(prev => [...prev, { role: 'bot', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText('');
    setMessages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Chatbot de Documentos</h1>
            <p className="text-sm text-slate-500 font-medium">Analiza PDF, Word y Excel con Inteligencia Artificial</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-md border-2 border-dashed border-slate-200 rounded-3xl p-12 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
            >
              <div className="bg-slate-50 group-hover:bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sube un documento para comenzar</h3>
              <p className="text-slate-500 text-sm mb-6">Arrastra y suelta o haz clic para seleccionar un archivo (PDF, DOCX, XLSX)</p>
              <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                Seleccionar Archivo
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <>
            {/* File Info Bar */}
            <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                {isExtracting && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Procesando...
                  </div>
                )}
              </div>
              <button 
                onClick={removeFile}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-100'
                    }`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      <div className="markdown-body prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                      <Bot className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu pregunta sobre el documento..."
                  disabled={isLoading || isExtracting}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || isExtracting}
                  className="absolute right-2 bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                Desarrollado con Gemini AI • IEP Señor de Huamantanga
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
