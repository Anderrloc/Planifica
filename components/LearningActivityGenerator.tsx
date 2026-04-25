
import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, FileText, Zap } from 'lucide-react';

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const GRADOS_POR_NIVEL: Record<string, string[]> = {
  "Inicial": ["3 años", "4 años", "5 años"],
  "Primaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"],
  "Secundaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"]
};
const AÑOS = ["2025", "2026", "2027"];

const LearningActivityGenerator: React.FC = () => {
  const [data, setData] = useState({
    institucion: "Jaén de Bracamoros",
    area: CURRICULUM_DATA.find(a => a.levels.includes("Secundaria"))?.area || CURRICULUM_DATA[0].area,
    grado: GRADOS_POR_NIVEL["Secundaria"][0],
    nivel: "Secundaria",
    docente: "DOCENTE ESPECIALISTA",
    año: "2026",
    nombreActividad: "Exploramos los ecosistemas de nuestra región",
    proposito: "Que los estudiantes identifiquen los componentes bióticos y abióticos de su entorno local.",
    duracionMinutos: 90,
    contexto: "Estudiantes que viven en una zona con alta biodiversidad pero poco conocimiento técnico sobre la misma.",
  });

  const getDidacticProcesses = (area: string) => {
    const areaLower = area.toLowerCase();
    if (areaLower.includes("matemática")) {
      return "Familiarización con el problema, Búsqueda y ejecución de estrategias, Socialización de representaciones, Reflexión y formalización, Planteamiento de otros problemas.";
    }
    if (areaLower.includes("comunicación") || areaLower.includes("inglés")) {
      return "Antes (del texto/discurso), Durante (del texto/discurso) y Después (del texto/discurso).";
    }
    if (areaLower.includes("ciencia y tecnología")) {
      return "Planteamiento del problema, Planteamiento de hipótesis, Elaboración del plan de acción, Recojo de datos y análisis de resultados, Estructuración del saber construido, Evaluación y comunicación.";
    }
    if (areaLower.includes("personal social") || areaLower.includes("ciencias sociales") || areaLower.includes("desarrollo personal")) {
      return "Problematización, Análisis de información, Toma de decisiones.";
    }
    if (areaLower.includes("arte y cultura")) {
      return "Desafiar e inspirar, Imaginar y generar ideas, Planificar, Explorar y experimentar, Producir trabajos preliminares, Revisar y afinar detalles, Presentar y compartir, Reflexionar y evaluar.";
    }
    if (areaLower.includes("religiosa")) {
      return "Ver, Juzgar, Actuar, Revisar, Celebrar.";
    }
    if (areaLower.includes("física")) {
      return "Calentamiento (Activación corporal), Actividad principal (Desarrollo de habilidades), Vuelta a la calma (Relajación/Estiramiento).";
    }
    if (areaLower.includes("trabajo")) {
      return "Preparación, Creación, Planificación, Ejecución, Evaluación.";
    }
    if (areaLower.includes("tutoría")) {
      return "Vivenciando, Reflexionando, Comprometiéndonos.";
    }
    return "Procesos didácticos específicos según el CNEB.";
  };

  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<Record<string, string[]>>({});
  const [selectedTransversalCompetencies, setSelectedTransversalCompetencies] = useState<string[]>([]);
  const [selectedTransversalCapacities, setSelectedTransversalCapacities] = useState<Record<string, string[]>>({});
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);

  const filteredAreas = useMemo(() => 
    CURRICULUM_DATA.filter(a => a.levels.includes(data.nivel))
  , [data.nivel]);

  const currentAreaCurriculum = useMemo(() => 
    filteredAreas.find(a => a.area === data.area) || filteredAreas[0] || CURRICULUM_DATA[0]
  , [data.area, filteredAreas]);

  const handleLevelChange = (nivel: string) => {
    const newGrado = GRADOS_POR_NIVEL[nivel][0];
    const newFilteredAreas = CURRICULUM_DATA.filter(a => a.levels.includes(nivel));
    const newArea = newFilteredAreas[0]?.area || CURRICULUM_DATA[0].area;
    
    setData({
      ...data,
      nivel,
      grado: newGrado,
      area: newArea
    });
    
    setSelectedCompetencies([]);
    setSelectedCapacities({});
    setSelectedTransversalCompetencies([]);
    setSelectedTransversalCapacities({});
  };

  const toggleCompetency = (id: string) => {
    setSelectedCompetencies(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleCapacity = (compId: string, capId: string) => {
    setSelectedCapacities(prev => {
      const current = prev[compId] || [];
      const next = current.includes(capId) ? current.filter(i => i !== capId) : [...current, capId];
      return { ...prev, [compId]: next };
    });
  };

  const toggleTransversalCompetency = (id: string) => {
    setSelectedTransversalCompetencies(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTransversalCapacity = (compId: string, capId: string) => {
    setSelectedTransversalCapacities(prev => {
      const current = prev[compId] || [];
      const next = current.includes(capId) ? current.filter(i => i !== capId) : [...current, capId];
      return { ...prev, [compId]: next };
    });
  };

  const toggleApproach = (name: string) => {
    setSelectedApproaches(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const [copied, setCopied] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrompt = () => {
    const compsText = filteredAreas.map(areaData => {
      const areaComps = areaData.competencies.filter(c => selectedCompetencies.includes(c.id));
      if (areaComps.length === 0) return null;

      const compsLines = areaComps.map(comp => {
        const caps = selectedCapacities[comp.id] || [];
        const capsText = caps.map(cid => comp.capacities.find(cap => cap.id === cid)?.name).join(", ");
        return `  - ${comp.name} (Capacidades: ${capsText})`;
      }).join("\n");

      return `Área: ${areaData.area}\n${compsLines}`;
    }).filter(Boolean).join("\n\n");

    const transCompsText = selectedTransversalCompetencies.map(id => {
      const comp = TRANSVERSAL_COMPETENCIES.find(c => c.id === id);
      const caps = selectedTransversalCapacities[id] || [];
      const capsText = caps.map(cid => comp?.capacities.find(cap => cap.id === cid)?.name).join(", ");
      return `- ${comp?.name} (Capacidades: ${capsText})`;
    }).join("\n");

    const approachesText = selectedApproaches.join(", ");
    const didacticProcesses = getDidacticProcesses(data.area);

    return `Actúa como un Especialista en Pedagogía y Didáctica del MINEDU. 
Diseña una ACTIVIDAD DE APRENDIZAJE con una SECUENCIA DIDÁCTICA DETALLADA para el año escolar ${data.año}.
Encabezado obligatorio: "AÑO DE LA CONSOLIDACIÓN DEL SISTEMA DEMOCRÁTICO"

I. DATOS INFORMATIVOS
- Institución Educativa: ${data.institucion}
- Área: ${data.area}
- Grado: ${data.grado}
- Nivel: ${data.nivel}
- Docente: ${data.docente}
- Nombre de la Actividad: ${data.nombreActividad}
- Propósito: ${data.proposito}
- Duración: ${data.duracionMinutos} minutos

II. PROPÓSITOS DE APRENDIZAJE
${compsText || "Seleccionar automáticamente según CNEB"}

Competencias Transversales:
${transCompsText || "Seleccionar automáticamente según CNEB"}

Enfoques Transversales: ${approachesText || "Seleccionar automáticamente según CNEB"}

III. SECUENCIA DIDÁCTICA DETALLADA (PRESENTAR EN TABLA)
Crea una tabla con las siguientes columnas:
MOMENTO | PROCESOS PEDAGÓGICOS / DIDÁCTICOS | ACTIVIDADES DETALLADAS (Docente y Estudiante) | RECURSOS | TIEMPO

La secuencia debe ser ALTAMENTE DETALLADA e incluir:
1. INICIO: Motivación (actividad lúdica o retadora), recuperación de saberes previos (preguntas clave), conflicto cognitivo (situación problemática) y comunicación del propósito y criterios de evaluación.
2. DESARROLLO: Aplicación rigurosa de los PROCESOS DIDÁCTICOS específicos del área de ${data.area}: ${didacticProcesses}. Gestión y acompañamiento del aprendizaje, actividades de alta demanda cognitiva, trabajo colaborativo y uso de recursos.
3. CIERRE: Metacognición profunda (¿qué aprendimos?, ¿cómo lo aprendimos?, ¿qué dificultades tuvimos?, ¿para qué nos sirve?) y evaluación formativa.

IV. EVALUACIÓN (PRESENTAR EN TABLA)
Crea una tabla con: Criterios de Evaluación, Evidencia de Aprendizaje, Instrumento de Evaluación.

V. MATERIALES Y RECURSOS
- Detalle de materiales físicos y digitales.

IMPORTANTE:
- Usa exclusivamente formato Markdown limpio.
- NO utilices etiquetas HTML como <br>, <p>, <div>, etc.
- Para saltos de línea, usa doble intro (estándar de Markdown).
- Las tablas deben seguir el formato estándar de Markdown (| columna |).`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = generatePrompt();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      if (response.text) {
        setGeneratedContent(response.text);
      }
    } catch (error: any) {
      console.error("Error generating activity:", error);
      if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
        alert("Error de API: Por favor, asegúrate de haber configurado tu API Key en el botón superior 'Configurar API'.");
      } else {
        alert("Error al generar la actividad. Por favor, intenta de nuevo.");
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
      sections: [{
        children: [
          new Paragraph({
            text: "PROMPT PARA ACTIVIDAD DE APRENDIZAJE",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          ...promptText.split('\n').map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 22, font: "Arial" })],
            spacing: { after: 120 }
          }))
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Prompt_Actividad_${data.nombreActividad.replace(/\s+/g, '_')}.docx`);
  };

  const exportActivityToWord = async () => {
    if (!generatedContent) return;

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
      sections: [{
        children: [
          new Paragraph({
            text: "ACTIVIDAD DE APRENDIZAJE",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          ...parseMarkdownToDocx(generatedContent)
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Actividad_${data.nombreActividad.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0a1128] text-white px-10 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-[12px] font-black uppercase tracking-widest">Planificación de Aula</h2>
          </div>
          <h3 className="text-2xl font-black uppercase">Actividad de Aprendizaje</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Secuencia didáctica detallada y procesos pedagógicos</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Actividad</label>
              <input 
                type="text" 
                value={data.nombreActividad}
                onChange={(e) => setData({...data, nombreActividad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Propósito de la Actividad</label>
              <textarea 
                value={data.proposito}
                onChange={(e) => setData({...data, proposito: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institución Educativa</label>
              <input 
                type="text" 
                value={data.institucion}
                onChange={(e) => setData({...data, institucion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel / Grado</label>
              <div className="flex gap-2">
                <select 
                  value={data.nivel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
                >
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select 
                  value={data.grado}
                  onChange={(e) => setData({...data, grado: e.target.value})}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
                >
                  {GRADOS_POR_NIVEL[data.nivel].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área Curricular</label>
              <select 
                value={data.area}
                onChange={(e) => setData({...data, area: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
              >
                {filteredAreas.map(a => <option key={a.area} value={a.area}>{a.area}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duración (Min)</label>
                <input 
                  type="number" 
                  value={data.duracionMinutos}
                  onChange={(e) => setData({...data, duracionMinutos: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Año</label>
                <select 
                  value={data.año}
                  onChange={(e) => setData({...data, año: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  {AÑOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-600 rounded-lg"></span>
              Competencias y Capacidades
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentAreaCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`p-6 rounded-2xl border-2 transition-all ${
                  selectedCompetencies.includes(comp.id) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'
                }`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input 
                      type="checkbox" 
                      checked={selectedCompetencies.includes(comp.id)}
                      onChange={() => toggleCompetency(comp.id)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{comp.name}</span>
                  </label>
                  {selectedCompetencies.includes(comp.id) && (
                    <div className="ml-8 space-y-2">
                      {comp.capacities.map(cap => (
                        <label key={cap.id} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(selectedCapacities[comp.id] || []).includes(cap.id)}
                            onChange={() => toggleCapacity(comp.id, cap.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{cap.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
              <span className="w-6 h-6 bg-slate-700 rounded-lg"></span>
              Competencias Transversales
            </h4>
            <div className="space-y-4">
              {TRANSVERSAL_COMPETENCIES.map(comp => (
                <div key={comp.id} className={`p-6 rounded-2xl border-2 transition-all ${
                  selectedTransversalCompetencies.includes(comp.id) ? 'border-slate-400 bg-slate-50' : 'border-slate-100'
                }`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input 
                      type="checkbox" 
                      checked={selectedTransversalCompetencies.includes(comp.id)}
                      onChange={() => toggleTransversalCompetency(comp.id)}
                      className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-600"
                    />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{comp.name}</span>
                  </label>
                  {selectedTransversalCompetencies.includes(comp.id) && (
                    <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {comp.capacities.map(cap => (
                        <label key={cap.id} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(selectedTransversalCapacities[comp.id] || []).includes(cap.id)}
                            onChange={() => toggleTransversalCapacity(comp.id, cap.id)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-600"
                          />
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{cap.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
              <span className="w-6 h-6 bg-indigo-600 rounded-lg"></span>
              Enfoques Transversales
            </h4>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRANSVERSAL_APPROACHES.map(app => (
                <label key={app} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedApproaches.includes(app)}
                    onChange={() => toggleApproach(app)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-[10px] font-black text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{app}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="px-10 py-6 bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Prompt Generado</h3>
          <div className="flex gap-2">
            <button 
              onClick={exportToWord}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-slate-700 text-white hover:bg-slate-600"
            >
              <FileText className="w-4 h-4" />
              Word
            </button>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {copied ? '¡COPIADO!' : 'COPIAR PROMPT'}
            </button>
          </div>
        </div>
        <div className="p-10">
          <pre className="bg-slate-950 p-8 rounded-2xl text-blue-200 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
            {generatePrompt()}
          </pre>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                isGenerating 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
              }`}
            >
              {isGenerating ? 'GENERANDO...' : 'GENERAR ACTIVIDAD CON IA'}
            </button>
          </div>
        </div>
      </section>

      {generatedContent && (
        <section className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
          <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Actividad Generada</h3>
            <button 
              onClick={exportActivityToWord}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500"
            >
              Exportar Word
            </button>
          </div>
          <div className="p-10 prose prose-slate max-w-none">
            <div className="markdown-body">
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  )
                }}
              >
                {generatedContent}
              </Markdown>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LearningActivityGenerator;
