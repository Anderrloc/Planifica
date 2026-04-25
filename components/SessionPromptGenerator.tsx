
import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLogo } from './LogoContext';

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const GRADOS_POR_NIVEL: Record<string, string[]> = {
  "Inicial": ["3 años", "4 años", "5 años"],
  "Primaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"],
  "Secundaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"]
};
const AÑOS = ["2025", "2026", "2027"];

const SessionPromptGenerator: React.FC = () => {
  const { logo, institutionName } = useLogo();
  const [data, setData] = useState({
    institucion: institutionName || "I.E. SEÑOR DE HUAMANTANGA N°16081",
    area: CURRICULUM_DATA.find(a => a.levels.includes("Secundaria"))?.area || CURRICULUM_DATA[0].area,
    grado: GRADOS_POR_NIVEL["Secundaria"][0],
    nivel: "Secundaria",
    docente: "DOCENTE ESPECIALISTA",
    director: "Yenny Velásquez Velázquez",
    año: "2026",
    nombreSesion: "Identificamos las características de nuestra comunidad",
    nombreUnidad: "Fortalecemos nuestra identidad local en un mundo globalizado",
    duracionMinutos: 90,
    contexto: "Estudiantes con necesidad de fortalecer su identidad local y pensamiento crítico frente a la era digital.",
  });

  React.useEffect(() => {
    if (institutionName) {
      setData(prev => ({ ...prev, institucion: institutionName }));
    }
  }, [institutionName]);

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
  };

  const handleAreaChange = (area: string) => {
    setData({ ...data, area });
    setSelectedCompetencies([]);
    setSelectedCapacities({});
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

  const selectAllCapacities = (compId: string) => {
    let comp;
    for (const area of filteredAreas) {
      comp = area.competencies.find(c => c.id === compId);
      if (comp) break;
    }
    if (!comp) return;
    
    setSelectedCapacities(prev => ({
      ...prev,
      [compId]: comp.capacities.map(c => c.id)
    }));
    
    if (!selectedCompetencies.includes(compId)) {
      setSelectedCompetencies(prev => [...prev, compId]);
    }
  };

  const selectAllTransversalCapacities = (compId: string) => {
    const comp = TRANSVERSAL_COMPETENCIES.find(c => c.id === compId);
    if (!comp) return;
    
    setSelectedTransversalCapacities(prev => ({
      ...prev,
      [compId]: comp.capacities.map(c => c.id)
    }));
    
    if (!selectedTransversalCompetencies.includes(compId)) {
      setSelectedTransversalCompetencies(prev => [...prev, compId]);
    }
  };

  const selectAllApproaches = () => {
    setSelectedApproaches([...TRANSVERSAL_APPROACHES]);
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
  const [generatedSession, setGeneratedSession] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getDidacticProcesses = (area: string) => {
    const areaLower = area.toLowerCase();
    if (areaLower.includes("matemática")) {
      return "Procesos didácticos de Matemática: Familiarización con el problema, Búsqueda y ejecución de estrategias, Socialización de representaciones, Reflexión y Formalización, Planteamiento de otros problemas.";
    }
    if (areaLower.includes("comunicación") || areaLower.includes("inglés")) {
      return "Procesos didácticos de Comunicación: \n- Para comprensión: Antes, Durante y Después de la lectura/escucha. \n- Para producción: Planificación, Textualización y Revisión. \n- Para oralidad: Antes, Durante y Después del discurso.";
    }
    if (areaLower.includes("ciencia y tecnología")) {
      return "Procesos didácticos de Ciencia y Tecnología: Planteamiento del problema, Planteamiento de hipótesis, Elaboración del plan de acción, Recojo de datos y análisis de resultados, Estructuración del saber construido, Evaluación y comunicación.";
    }
    if (areaLower.includes("personal social") || areaLower.includes("ciencias sociales") || areaLower.includes("desarrollo personal") || areaLower.includes("formación ciudadana")) {
      return "Procesos didácticos de Personal Social/CC.SS.: Problematización, Análisis de información, Toma de decisiones.";
    }
    if (areaLower.includes("arte")) {
      return "Procesos didácticos de Arte y Cultura: Desafiar e inspirar, Imaginar y generar ideas, Planificar, Explorar y experimentar, Producir trabajos preliminares, Revisar y afinar, Presentar y compartir, Reflexionar y evaluar.";
    }
    if (areaLower.includes("religiosa")) {
      return "Procesos didácticos de Educación Religiosa: Ver, Juzgar, Actuar, Revisar, Celebrar.";
    }
    if (areaLower.includes("física")) {
      return "Procesos didácticos de Educación Física: Calentamiento (Activación corporal), Actividad principal (Desarrollo), Vuelta a la calma (Relajación).";
    }
    if (areaLower.includes("trabajo")) {
      return "Procesos didácticos de EPT: Preparación, Creación, Planificación, Ejecución, Evaluación (Metodología Design Thinking o similar).";
    }
    return "Procesos didácticos específicos del área según el CNEB.";
  };

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

    return `Actúa como un Especialista en Planificación Curricular del Ministerio de Educación (MINEDU) de Perú. 
Diseña una SESIÓN DE APRENDIZAJE innovadora detallada para el año escolar ${data.año} siguiendo estrictamente esta estructura, bajo el Marco del Buen Desempeño Docente y PRESENTANDO LA INFORMACIÓN EN TABLAS cuando se solicite.

IMPORTANTE: 
- Usa exclusivamente formato Markdown limpio.
- NO utilices etiquetas HTML como <br>, <p>, <div>, etc.
- Para saltos de línea, usa doble intro (estándar de Markdown).
- Las tablas deben seguir el formato estándar de Markdown (| columna |).

I. DATOS INFORMATIVOS
- Institución Educativa: ${data.institucion}
- Área Curricular: ${data.area}
- Grado y Sección: ${data.grado}
- Nivel: ${data.nivel}
- Docente Responsable: ${data.docente}
- Director(a): ${data.director}
- Título de la Unidad: ${data.nombreUnidad}
- Título de la Sesión: ${data.nombreSesion}
- Duración: ${data.duracionMinutos} minutos

II. ESTÁNDAR DE APRENDIZAJE
- Describe el estándar de aprendizaje del ciclo correspondiente para las competencias seleccionadas.

III. PROPÓSITOS DE APRENDIZAJE (PRESENTAR EN TABLA)
Crea una tabla que incluya las siguientes columnas:
1. Competencias del área seleccionadas:
${compsText || "Seleccionar automáticamente según CNEB"}
2. Capacidades por cada competencia.
3. Desempeños precisos para el grado.
4. Criterios de Evaluación.
5. Evidencia de Aprendizaje e Instrumento de Evaluación.

IV. ENFOQUES TRANSVERSALES Y COMPETENCIAS TRANSVERSALES (PRESENTAR EN TABLA)
Crea una tabla que organice:
- Competencias Transversales:
${transCompsText || "Seleccionar automáticamente según CNEB"}
- Enfoques Transversales: ${approachesText || "Seleccionar automáticamente según CNEB"}
- Acciones observables/Valores.

V. MOMENTOS DE LA SESIÓN SEGUN EL AREA (PRESENTAR EN TABLA)
Diseña una tabla detallada con los momentos de la sesión:
1. INICIO (Motivación, Saberes previos, Conflicto cognitivo, Propósito y organización).
2. DESARROLLO (Gestión y acompañamiento del desarrollo de las competencias - ${getDidacticProcesses(data.area)}).
3. CIERRE (Metacognición y evaluación).
Columnas: Momentos, Procesos Pedagógicos/Estrategias, Recursos y Tiempo.

VI. REFLEXIONES SOBRE EL APRENDIZAJE
- ¿Qué avances tuvieron mis estudiantes?
- ¿Qué dificultades tuvieron mis estudiantes?
- ¿Qué aprendizajes debo reforzar en la siguiente sesión?

VII. MATERIALES Y RECURSOS
- Lista de materiales físicos y digitales necesarios para la sesión.

VIII. BIBLIOGRAFÍA
- Referencias bibliográficas para el docente y el estudiante (APA).

Asegúrate de que todo el contenido esté alineado al Currículo Nacional de la Educación Básica (CNEB) vigente y que el formato de tablas sea claro y profesional.`;
  };

  const handleGenerateSession = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = generatePrompt();
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      if (response.text) {
        // Limpiar etiquetas HTML comunes que el modelo pueda generar por error
        const cleanText = response.text
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<p>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<div>/gi, '\n')
          .replace(/<\/div>/gi, '\n');
        setGeneratedSession(cleanText);
      }
    } catch (error: any) {
      console.error("Error generating session:", error);
      if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
        alert("Error de API: Por favor, asegúrate de haber configurado tu API Key en el botón superior 'Configurar API'.");
      } else {
        alert("Hubo un error al generar la sesión. Por favor, intenta de nuevo.");
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
      title: `Prompt Sesión - ${data.nombreSesion}`,
      description: "Prompt para generar sesión de aprendizaje",
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            text: "PROMPT PARA GENERAR SESIÓN DE APRENDIZAJE",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Sesión: ${data.nombreSesion}`,
                bold: true,
                size: 24,
                font: "Arial"
              }),
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
    saveAs(blob, `Prompt_Sesion_${data.nombreSesion.replace(/\s+/g, '_')}.docx`);
  };

  const exportSessionToWord = async () => {
    if (!generatedSession) return;

    const parseMarkdownToDocx = (text: string) => {
      const lines = text.split('\n');
      const children: any[] = [];
      
      // Add Logo if exists
      if (logo) {
        try {
          const base64Data = logo.split(',')[1];
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          
          const mimeType = logo.split(';')[0].split(':')[1];
          const imageType = mimeType.split('/')[1] as any;
          
          children.push(new Paragraph({
            children: [
              new ImageRun({
                data: bytes,
                transformation: {
                  width: 80,
                  height: 80,
                },
                type: imageType === 'svg+xml' ? 'svg' : imageType,
              } as any),
            ],
            alignment: AlignmentType.RIGHT,
          }));
        } catch (e) {
          console.error("Error adding logo to docx", e);
        }
      }

      // Add Institution Header
      children.push(new Paragraph({
        children: [
          new TextRun({
            text: institutionName || data.institucion,
            bold: true,
            size: 20,
            color: "475569"
          })
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 }
      }));

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
          // Filter out the separator line |---|---|
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

        // Table detection
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
          children.push(new Paragraph({ 
            children: processText(line.substring(2)),
            bullet: { level: 0 },
            spacing: { after: 120 }
          }));
        } else if (line.match(/^\d+\. /)) {
          children.push(new Paragraph({ 
            children: processText(line), // Keep the number in the text for maximum compatibility
            spacing: { after: 120 }
          }));
        } else if (line !== '') {
          children.push(new Paragraph({ 
            children: processText(line),
            spacing: { after: 120 }
          }));
        } else {
          children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
        }
      }
      
      if (inTable) flushTable();
      return children;
    };

    const doc = new Document({
      creator: "Planificador Curricular Institucional",
      title: `Sesión - ${data.nombreSesion}`,
      description: "Sesión de aprendizaje generada con IA",
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          new Paragraph({
            text: "SESIÓN DE APRENDIZAJE",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Institución: ${data.institucion}`,
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Título: ${data.nombreSesion}`,
                bold: true,
                size: 24,
                font: "Arial"
              }),
            ],
            spacing: { after: 400 },
          }),
          ...parseMarkdownToDocx(generatedSession)
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Sesion_${data.nombreSesion.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-10 py-8">
          <h2 className="text-[12px] font-black text-emerald-400 uppercase tracking-widest mb-2">Generador de Prompts</h2>
          <h3 className="text-2xl font-black uppercase">Sesión de Aprendizaje</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Configura los datos para obtener un prompt de sesión profesional</p>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Sesión</label>
              <input 
                type="text" 
                value={data.nombreSesion}
                onChange={(e) => setData({...data, nombreSesion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
                placeholder="Ej: Identificamos las características..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Unidad (Referencia)</label>
              <input 
                type="text" 
                value={data.nombreUnidad}
                onChange={(e) => setData({...data, nombreUnidad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institución Educativa</label>
              <input 
                type="text" 
                value={data.institucion}
                onChange={(e) => setData({...data, institucion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Director(a)</label>
              <input 
                type="text" 
                value={data.director}
                onChange={(e) => setData({...data, director: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel / Grado</label>
              <div className="flex gap-2">
                <select 
                  value={data.nivel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none"
                >
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select 
                  value={data.grado}
                  onChange={(e) => setData({...data, grado: e.target.value})}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none"
                >
                  {GRADOS_POR_NIVEL[data.nivel].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área Curricular</label>
              <select 
                value={data.area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none"
              >
                {filteredAreas.map(a => <option key={a.area} value={a.area}>{a.area}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duración (Minutos)</label>
                <input 
                  type="number" 
                  value={data.duracionMinutos}
                  onChange={(e) => setData({...data, duracionMinutos: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Año</label>
                <select 
                  value={data.año}
                  onChange={(e) => setData({...data, año: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 text-center appearance-none"
                >
                  {AÑOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
                <span className="w-6 h-6 bg-emerald-600 rounded-lg"></span>
                Competencias y Capacidades: {currentAreaCurriculum.area}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNEB - PERÚ</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentAreaCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 group/card ${
                  selectedCompetencies.includes(comp.id) 
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/5 ring-4 ring-emerald-500/5' 
                    : 'border-slate-100 hover:border-emerald-200 hover:shadow-lg'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <label className="flex items-start gap-4 cursor-pointer group flex-1">
                      <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                        selectedCompetencies.includes(comp.id) 
                          ? 'bg-emerald-600 border-emerald-600' 
                          : 'border-slate-300 group-hover:border-emerald-400'
                      }`}>
                        {selectedCompetencies.includes(comp.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M5 13l4 4L19 7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <input 
                          type="checkbox" 
                          checked={selectedCompetencies.includes(comp.id)}
                          onChange={() => toggleCompetency(comp.id)}
                          className="hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-sm font-black leading-tight block transition-colors ${
                          selectedCompetencies.includes(comp.id) ? 'text-slate-900' : 'text-slate-600 group-hover:text-emerald-600'
                        }`}>
                          {comp.name}
                        </span>
                        {!selectedCompetencies.includes(comp.id) && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click para ver capacidades</span>
                        )}
                      </div>
                    </label>
                    
                    {selectedCompetencies.includes(comp.id) && (
                      <button 
                        onClick={() => selectAllCapacities(comp.id)}
                        className="shrink-0 text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-600 hover:text-white border border-emerald-200 px-3 py-1.5 rounded-full transition-all"
                      >
                        Todas
                      </button>
                    )}
                  </div>
                  
                  {selectedCompetencies.includes(comp.id) && (
                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Capacidades Seleccionadas</h5>
                      <div className="grid grid-cols-1 gap-3">
                        {comp.capacities.map(cap => (
                          <label key={cap.id} className={`flex items-start gap-3 cursor-pointer group/cap p-3 rounded-xl transition-all ${
                            (selectedCapacities[comp.id] || []).includes(cap.id)
                              ? 'bg-emerald-50/50 border border-emerald-100'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={(selectedCapacities[comp.id] || []).includes(cap.id)}
                              onChange={() => toggleCapacity(comp.id, cap.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                            />
                            <span className={`text-xs font-bold transition-colors leading-tight ${
                              (selectedCapacities[comp.id] || []).includes(cap.id)
                                ? 'text-emerald-900'
                                : 'text-slate-500 group-hover/cap:text-slate-800'
                            }`}>
                              {cap.name}
                            </span>
                          </label>
                        ))}
                      </div>
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
                <div key={comp.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedTransversalCompetencies.includes(comp.id)}
                        onChange={() => toggleTransversalCompetency(comp.id)}
                        className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-600"
                      />
                      <span className="text-sm font-black text-slate-800 group-hover:text-slate-600 transition-colors">{comp.name}</span>
                    </label>
                    
                    {selectedTransversalCompetencies.includes(comp.id) && (
                      <button 
                        onClick={() => selectAllTransversalCapacities(comp.id)}
                        className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-600 hover:text-white border border-slate-200 px-3 py-1.5 rounded-full transition-all"
                      >
                        Todas
                      </button>
                    )}
                  </div>
                  
                  {selectedTransversalCompetencies.includes(comp.id) && (
                    <div className="mt-4 ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {comp.capacities.map(cap => (
                        <label key={cap.id} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(selectedTransversalCapacities[comp.id] || []).includes(cap.id)}
                            onChange={() => toggleTransversalCapacity(comp.id, cap.id)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-600 focus:ring-slate-600"
                          />
                          <span className="text-xs font-bold text-slate-500">{cap.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
                <span className="w-6 h-6 bg-indigo-600 rounded-lg"></span>
                Enfoques Transversales
              </h4>
              <button 
                onClick={selectAllApproaches}
                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white border border-indigo-200 px-3 py-1.5 rounded-full transition-all"
              >
                Seleccionar Todos
              </button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRANSVERSAL_APPROACHES.map(app => (
                <label key={app} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedApproaches.includes(app)}
                    onChange={() => toggleApproach(app)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-xs font-black text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{app}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contexto / Situación de la Sesión</label>
            <textarea 
              value={data.contexto}
              onChange={(e) => setData({...data, contexto: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 min-h-[100px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="px-10 py-6 bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Prompt Generado para Copiar</h3>
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
                copied ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ¡COPIADO!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  COPIAR PROMPT
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-10">
          <pre className="bg-slate-950 p-8 rounded-2xl text-emerald-200 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
            {generatePrompt()}
          </pre>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerateSession}
              disabled={isGenerating}
              className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                isGenerating 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  GENERANDO SESIÓN...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  GENERAR SESIÓN CON IA
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {generatedSession && (
        <section className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
          <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Sesión Generada
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={exportSessionToWord}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 text-white hover:bg-blue-500"
              >
                Exportar Word
              </button>
            </div>
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
                {generatedSession}
              </Markdown>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default SessionPromptGenerator;
