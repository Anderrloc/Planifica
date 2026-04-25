
import React, { useState, useMemo } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CURRICULUM_DATA } from '../src/data/curriculum';

const GAME_TYPES = [
  "Crucigrama",
  "Sopa de letras",
  "Adivinanzas",
  "Cuestionario (Quiz)",
  "Rompecabezas de palabras",
  "Relacionar columnas",
  "Completar oraciones",
  "Otros"
];

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const GRADOS_POR_NIVEL: Record<string, string[]> = {
  "Inicial": ["3 años", "4 años", "5 años"],
  "Primaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"],
  "Secundaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"]
};

const GamesGenerator: React.FC = () => {
  const [data, setData] = useState({
    institucion: "I.E. SEÑOR DE HUAMANTANGA N°16081",
    nivel: "Primaria",
    grado: "5° Grado",
    area: "Ciencia y Tecnología",
    tema: "Los ecosistemas",
    tipoJuego: GAME_TYPES[0],
    cantidadItems: 10,
    instrucciones: "Crear un juego divertido y educativo que refuerce los conceptos clave del tema.",
  });

  const [copied, setCopied] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredAreas = useMemo(() => 
    CURRICULUM_DATA.filter(a => a.levels.includes(data.nivel))
  , [data.nivel]);

  const generatePrompt = () => {
    return `Actúa como un Especialista en Gamificación Educativa. 
Diseña un recurso didáctico de tipo "${data.tipoJuego}" para estudiantes de ${data.grado} de ${data.nivel} en el área de ${data.area}.

ÁREA: ${data.area}
TEMA: ${data.tema}
TIPO DE JUEGO: ${data.tipoJuego}
CANTIDAD DE ITEMS/PREGUNTAS: ${data.cantidadItems}
INSTRUCCIONES ADICIONALES: ${data.instrucciones}

ESTRUCTURA DEL RECURSO:
1. Título llamativo del juego.
2. Instrucciones claras para el estudiante.
3. Contenido del juego:
   - Si es Crucigrama: Proporciona las definiciones (Horizontales y Verticales) y la lista de palabras correctas.
   - Si es Sopa de letras: Proporciona la lista de palabras a buscar y una cuadrícula sugerida o descripción de cómo armarla.
   - Si es Adivinanzas: Proporciona ${data.cantidadItems} adivinanzas con sus respectivas respuestas.
   - Si es Cuestionario: Proporciona preguntas con opciones y la respuesta correcta.
4. Clave de respuestas para el docente al final.

REQUERIMIENTOS TÉCNICOS:
- Usa exclusivamente formato Markdown limpio.
- NO utilices etiquetas HTML.
- Las tablas deben seguir el formato estándar de Markdown.
- El lenguaje debe ser adecuado para la edad de los estudiantes (${data.grado} de ${data.nivel}).
- Asegúrate de que el contenido sea pedagógicamente valioso y motivador.

Presenta el contenido de forma organizada y lista para ser utilizada.`;
  };

  const handleGenerateGame = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = generatePrompt();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      if (response.text) {
        const cleanText = response.text
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<p>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<div>/gi, '\n')
          .replace(/<\/div>/gi, '\n');
        setGeneratedGame(cleanText);
      }
    } catch (error: any) {
      console.error("Error generating game:", error);
      if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
        alert("Error de API: Por favor, asegúrate de haber configurado tu API Key en el botón superior 'Configurar API'.");
      } else {
        alert("Hubo un error al generar el juego. Por favor, intenta de nuevo.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToWord = async () => {
    const promptText = generatePrompt();
    const doc = new Document({
      creator: "Planificador Curricular Institucional",
      title: `Prompt Juego - ${data.tema}`,
      description: "Prompt para generar juego educativo",
      sections: [{
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          new Paragraph({
            text: "PROMPT PARA GENERAR JUEGO EDUCATIVO",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Juego: ${data.tipoJuego} - ${data.tema}`, bold: true, size: 24, font: "Arial" }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          ...promptText.split('\n').map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 22, font: "Arial" })],
            spacing: { after: 120 }
          }))
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Prompt_Juego_${data.tema.replace(/\s+/g, '_')}.docx`);
  };

  const exportGameToWord = async () => {
    if (!generatedGame) return;

    const parseMarkdownToDocx = (text: string) => {
      const lines = text.split('\n');
      const children: any[] = [];
      let currentTable: string[][] = [];
      let inTable = false;

      const processText = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return parts.map(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({ text: part.slice(2, -2), bold: true, size: 22 });
          }
          return new TextRun({ text: part, size: 22 });
        });
      };

      const flushTable = () => {
        if (currentTable.length > 0) {
          const filteredRows = currentTable.filter(row => !row.every(cell => cell.trim().match(/^-+$/)));
          if (filteredRows.length > 0) {
            children.push(new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: filteredRows.map((row, rowIndex) => new TableRow({
                children: row.map(cell => new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ text: cell.trim(), size: 20, bold: rowIndex === 0 })],
                  })],
                  shading: rowIndex === 0 ? { fill: "F5F5F5" } : undefined,
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
                  }
                }))
              }))
            }));
            children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
          }
          currentTable = [];
        }
        inTable = false;
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          inTable = true;
          const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          currentTable.push(cells);
          continue;
        } else if (inTable) {
          flushTable();
        }

        if (line.startsWith('# ')) {
          children.push(new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
        } else if (line.startsWith('## ')) {
          children.push(new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 } }));
        } else if (line.startsWith('### ')) {
          children.push(new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } }));
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          children.push(new Paragraph({ children: processText(line.substring(2)), bullet: { level: 0 }, spacing: { after: 120 } }));
        } else if (line.match(/^\d+\. /)) {
          children.push(new Paragraph({ children: processText(line), spacing: { after: 120 } }));
        } else if (line !== '') {
          children.push(new Paragraph({ children: processText(line), spacing: { after: 120 } }));
        } else {
          children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
        }
      }
      if (inTable) flushTable();
      return children;
    };

    const doc = new Document({
      creator: "Planificador Curricular Institucional",
      title: `Juego - ${data.tema}`,
      description: "Recurso didáctico generado con IA",
      sections: [{
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children: [
          new Paragraph({
            text: `RECURSO DIDÁCTICO: ${data.tipoJuego.toUpperCase()}`,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Institución: ${data.institucion}`, bold: true, size: 24, font: "Arial" }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Tema: ${data.tema}`, bold: true, size: 24, font: "Arial" }),
            ],
            spacing: { after: 400 },
          }),
          ...parseMarkdownToDocx(generatedGame)
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Juego_${data.tema.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-purple-900 text-white px-10 py-8">
          <h2 className="text-[12px] font-black text-purple-300 uppercase tracking-widest mb-2">Generador de Juegos</h2>
          <h3 className="text-2xl font-black uppercase">Gamificación Educativa</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Crea crucigramas, sopa de letras y más para tus clases</p>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tema del Juego</label>
              <input 
                type="text" 
                value={data.tema}
                onChange={(e) => setData({...data, tema: e.target.value})}
                className="w-full bg-purple-50 border border-purple-100 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20"
                placeholder="Ej: Los ecosistemas, La Revolución Francesa..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Juego</label>
              <select 
                value={data.tipoJuego}
                onChange={(e) => setData({...data, tipoJuego: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20 appearance-none"
              >
                {GAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cantidad de Items / Preguntas</label>
              <input 
                type="number" 
                value={data.cantidadItems}
                onChange={(e) => setData({...data, cantidadItems: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área Curricular</label>
              <select 
                value={data.area}
                onChange={(e) => setData({...data, area: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20 appearance-none"
              >
                {filteredAreas.map(a => <option key={a.area} value={a.area}>{a.area}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel / Grado</label>
              <div className="flex gap-2">
                <select 
                  value={data.nivel}
                  onChange={(e) => {
                    const nivel = e.target.value;
                    const newFilteredAreas = CURRICULUM_DATA.filter(a => a.levels.includes(nivel));
                    const newArea = newFilteredAreas[0]?.area || "General";
                    setData({
                      ...data, 
                      nivel, 
                      grado: GRADOS_POR_NIVEL[nivel][0],
                      area: newArea
                    });
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20 appearance-none"
                >
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select 
                  value={data.grado}
                  onChange={(e) => setData({...data, grado: e.target.value})}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20 appearance-none"
                >
                  {GRADOS_POR_NIVEL[data.nivel].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institución Educativa</label>
              <input 
                type="text" 
                value={data.institucion}
                onChange={(e) => setData({...data, institucion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instrucciones Adicionales</label>
              <textarea 
                value={data.instrucciones}
                onChange={(e) => setData({...data, instrucciones: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-600/20 min-h-[100px]"
                placeholder="Ej: Incluir palabras como fotosíntesis, clorofila..."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="px-10 py-6 bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Prompt Generado para Copiar</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={exportToWord}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Word
            </button>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {copied ? '¡COPIADO!' : 'COPIAR PROMPT'}
            </button>
          </div>
        </div>
        <div className="p-10">
          <pre className="bg-slate-950 p-8 rounded-2xl text-purple-200 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
            {generatePrompt()}
          </pre>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerateGame}
              disabled={isGenerating}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                isGenerating 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-500 hover:scale-105 active:scale-95'
              }`}
            >
              {isGenerating ? 'GENERANDO JUEGO...' : 'GENERAR JUEGO CON IA'}
            </button>
          </div>
        </div>
      </section>

      {generatedGame && (
        <section className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
          <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Juego Generado
            </h3>
            <button 
              onClick={exportGameToWord}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500"
            >
              Exportar Word
            </button>
          </div>
          <div className="p-10 prose prose-slate max-w-none">
            <div className="markdown-body">
              <Markdown remarkPlugins={[remarkGfm]}>
                {generatedGame}
              </Markdown>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default GamesGenerator;
