
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { jsPDF } from "jspdf";
import { saveAs } from 'file-saver';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Question {
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blanks' | 'matching';
  question: string;
  options?: string[];
  matchingPairs?: { left: string; right: string }[];
  answer: string;
}

interface Exam {
  title: string;
  instructions: string;
  questions: Question[];
}

const ExamFromTextGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [counts, setCounts] = useState({
    multiple_choice: 5,
    true_false: 2,
    short_answer: 2,
    fill_in_blanks: 2,
    matching: 1
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setExam(null);
    setExtractedText("");
    setIsExtracting(true);

    try {
      let text = "";
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (selectedFile.type === "application/pdf") {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }
        text = fullText;
      } else if (selectedFile.type === "text/plain") {
        text = await selectedFile.text();
      } else {
        throw new Error("Formato de archivo no soportado. Por favor sube un PDF, Word (.docx) o Texto (.txt).");
      }

      if (!text.trim()) {
        throw new Error("No se pudo extraer texto del documento.");
      }

      setExtractedText(text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al procesar el archivo.");
    } finally {
      setIsExtracting(false);
    }
  };

  const generateExam = async () => {
    if (!extractedText) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza el siguiente texto y genera un examen completo basado en su contenido. 
        El examen debe incluir exactamente el siguiente número de preguntas por tipo:
        - Opción múltiple: ${counts.multiple_choice}
        - Verdadero/Falso: ${counts.true_false}
        - Respuesta corta (abiertas): ${counts.short_answer}
        - Completar (fill in the blanks): ${counts.fill_in_blanks}
        - Relacionar (matching pairs): ${counts.matching}
        
        Para las preguntas de relacionar, proporciona una lista de pares (izquierda y derecha).
        
        Texto:
        ${extractedText.substring(0, 15000)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              instructions: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { 
                      type: Type.STRING, 
                      enum: ['multiple_choice', 'true_false', 'short_answer', 'fill_in_blanks', 'matching'] 
                    },
                    question: { type: Type.STRING },
                    options: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "Solo para opción múltiple"
                    },
                    matchingPairs: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          left: { type: Type.STRING },
                          right: { type: Type.STRING }
                        },
                        required: ["left", "right"]
                      },
                      description: "Solo para preguntas de relacionar"
                    },
                    answer: { type: Type.STRING }
                  },
                  required: ["type", "question", "answer"]
                }
              }
            },
            required: ["title", "instructions", "questions"]
          }
        }
      });

      const generatedExam = JSON.parse(response.text || "{}");
      setExam(generatedExam);
    } catch (err: any) {
      console.error(err);
      setError("Error al generar el examen con IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToWord = async () => {
    if (!exam) return;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: exam.title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: exam.instructions,
            spacing: { before: 200, after: 400 },
          }),
          ...exam.questions.flatMap((q, i) => {
            const questionParagraphs = [
              new Paragraph({
                children: [
                  new TextRun({ text: `${i + 1}. ${q.question}`, bold: true }),
                ],
                spacing: { before: 200 },
              })
            ];

            if (q.type === 'multiple_choice' && q.options) {
              q.options.forEach((opt, optIdx) => {
                questionParagraphs.push(new Paragraph({
                  text: `${String.fromCharCode(97 + optIdx)}) ${opt}`,
                  indent: { left: 720 },
                }));
              });
            } else if (q.type === 'true_false') {
              questionParagraphs.push(new Paragraph({
                text: "a) Verdadero    b) Falso",
                indent: { left: 720 },
              }));
            } else if (q.type === 'short_answer' || q.type === 'fill_in_blanks') {
              questionParagraphs.push(new Paragraph({
                text: "__________________________________________________________________",
                indent: { left: 720 },
              }));
            } else if (q.type === 'matching' && q.matchingPairs) {
              q.matchingPairs.forEach((pair, pIdx) => {
                questionParagraphs.push(new Paragraph({
                  text: `${pIdx + 1}. ${pair.left}  (   )  ${pair.right}`,
                  indent: { left: 720 },
                }));
              });
            }

            return questionParagraphs;
          }),
          new Paragraph({
            text: "CLAVE DE RESPUESTAS",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 400 },
          }),
          ...exam.questions.map((q, i) => (
            new Paragraph({
              children: [
                new TextRun({ text: `${i + 1}. `, bold: true }),
                new TextRun({ text: q.answer }),
              ],
            })
          ))
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${exam.title.replace(/\s+/g, '_')}.docx`);
  };

  const exportToPDF = () => {
    if (!exam) return;

    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(exam.title, pageWidth - margin * 2);
    doc.text(titleLines, pageWidth / 2, y, { align: "center" });
    y += titleLines.length * 7 + 10;

    // Instructions
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const instrLines = doc.splitTextToSize(exam.instructions, pageWidth - margin * 2);
    doc.text(instrLines, margin, y);
    y += instrLines.length * 5 + 10;

    // Questions
    exam.questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      const qText = `${i + 1}. ${q.question}`;
      const qLines = doc.splitTextToSize(qText, pageWidth - margin * 2);
      doc.text(qLines, margin, y);
      y += qLines.length * 5 + 2;

      doc.setFont("helvetica", "normal");
      if (q.type === 'multiple_choice' && q.options) {
        q.options.forEach((opt, optIdx) => {
          const optText = `${String.fromCharCode(97 + optIdx)}) ${opt}`;
          const optLines = doc.splitTextToSize(optText, pageWidth - margin * 3);
          doc.text(optLines, margin + 10, y);
          y += optLines.length * 5;
        });
      } else if (q.type === 'true_false') {
        doc.text("a) Verdadero    b) Falso", margin + 10, y);
        y += 7;
      } else if (q.type === 'short_answer' || q.type === 'fill_in_blanks') {
        doc.text("__________________________________________________________________", margin + 10, y);
        y += 7;
      } else if (q.type === 'matching' && q.matchingPairs) {
        q.matchingPairs.forEach((pair, pIdx) => {
          const pairText = `${pIdx + 1}. ${pair.left}  (   )  ${pair.right}`;
          const pairLines = doc.splitTextToSize(pairText, pageWidth - margin * 3);
          doc.text(pairLines, margin + 10, y);
          y += pairLines.length * 5;
        });
      }
      y += 5;
    });

    // Answer Key
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CLAVE DE RESPUESTAS", pageWidth / 2, y, { align: "center" });
    y += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    exam.questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const ansText = `${i + 1}. ${q.answer}`;
      const ansLines = doc.splitTextToSize(ansText, pageWidth - margin * 2);
      doc.text(ansLines, margin, y);
      y += ansLines.length * 5 + 2;
    });

    doc.save(`${exam.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-900 text-white px-10 py-8 rounded-t-[2rem]">
        <h2 className="text-[12px] font-black text-rose-400 uppercase tracking-widest mb-2">Módulo de Creación</h2>
        <h3 className="text-2xl font-black uppercase">Generador de Examen desde Texto</h3>
        <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Importa un tema y genera una evaluación completa</p>
      </div>

      <div className="p-10 bg-white rounded-b-[2rem] shadow-xl border-x border-b border-slate-200 space-y-10">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-12 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
            {file ? file.name : "Haz clic para subir un archivo PDF, Word o Texto"}
          </p>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Soporta .pdf, .docx y .txt</p>
        </div>

        {isExtracting && (
          <div className="flex items-center justify-center gap-3 text-rose-600 font-bold animate-pulse">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Extrayendo contenido...
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-xs font-bold uppercase tracking-tight">
            {error}
          </div>
        )}

        {extractedText && !isGenerating && !exam && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Opción Múltiple</label>
                <input 
                  type="number" 
                  value={counts.multiple_choice}
                  onChange={(e) => setCounts({...counts, multiple_choice: parseInt(e.target.value) || 0})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">V / F</label>
                <input 
                  type="number" 
                  value={counts.true_false}
                  onChange={(e) => setCounts({...counts, true_false: parseInt(e.target.value) || 0})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Abiertas</label>
                <input 
                  type="number" 
                  value={counts.short_answer}
                  onChange={(e) => setCounts({...counts, short_answer: parseInt(e.target.value) || 0})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Completar</label>
                <input 
                  type="number" 
                  value={counts.fill_in_blanks}
                  onChange={(e) => setCounts({...counts, fill_in_blanks: parseInt(e.target.value) || 0})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase">Relacionar</label>
                <input 
                  type="number" 
                  value={counts.matching}
                  onChange={(e) => setCounts({...counts, matching: parseInt(e.target.value) || 0})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-rose-600/20"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={generateExam}
                className="bg-rose-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
              >
                Generar Examen con IA
              </button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-rose-600 font-bold animate-bounce">
              Diseñando evaluación...
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-full animate-progress-indeterminate"></div>
            </div>
          </div>
        )}

        {exam && (
          <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Vista Previa del Examen</h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAnswers(!showAnswers)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    showAnswers 
                      ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {showAnswers ? 'Ocultar Respuestas' : 'Mostrar Respuestas'}
                </button>
                <button 
                  onClick={exportToWord}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Word
                </button>
                <button 
                  onClick={exportToPDF}
                  className="bg-rose-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 space-y-8">
              <div className="text-center space-y-2">
                <h5 className="text-xl font-black text-slate-900 uppercase">{exam.title}</h5>
                <p className="text-sm text-slate-500 font-medium italic">{exam.instructions}</p>
              </div>

              <div className="space-y-8">
                {exam.questions.map((q, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex gap-4">
                      <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0 text-xs font-black">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-800 pt-1">{q.question}</p>
                    </div>

                    <div className="ml-12 space-y-2">
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
                              <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black uppercase">
                                {String.fromCharCode(97 + optIdx)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.type === 'true_false' && (
                        <div className="flex gap-4">
                          <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">Verdadero</div>
                          <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">Falso</div>
                        </div>
                      )}
                      {(q.type === 'short_answer' || q.type === 'fill_in_blanks') && (
                        <div className="w-full h-12 border-b-2 border-slate-200 border-dashed"></div>
                      )}
                      {q.type === 'matching' && q.matchingPairs && (
                        <div className="space-y-3">
                          {q.matchingPairs.map((pair, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between gap-4">
                              <div className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
                                {pIdx + 1}. {pair.left}
                              </div>
                              <div className="w-12 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                                ( )
                              </div>
                              <div className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 text-right">
                                {pair.right}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {showAnswers && (
                      <div className="ml-12 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Respuesta Correcta</p>
                        <p className="text-sm font-bold text-emerald-800">{q.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamFromTextGenerator;
