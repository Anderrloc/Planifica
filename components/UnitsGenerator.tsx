
import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, FileText, Sparkles, Loader2, CheckCircle2, Layout } from 'lucide-react';

const GRADOS = ["1°", "2°", "3°", "4°", "5°"];
const AREAS_SECUNDARIA = [
  "Comunicación",
  "Matemática",
  "Ciencia y Tecnología",
  "Ciencias Sociales",
  "Desarrollo Personal, Ciudadanía y Cívica",
  "Arte y Cultura",
  "Educación Física",
  "Inglés (Lengua Extranjera)",
  "Educación Religiosa",
  "Educación para el Trabajo",
  "Tutoría"
];

const UnitsGenerator: React.FC = () => {
  const [data, setData] = useState({
    dre: "Cajamarca",
    ugel: "Jaén",
    institucion: "I.E. SEÑOR DE HUAMANTANGA N°16081",
    area: "Matemática",
    grado: "1°",
    seccion: "A",
    ciclo: "VI",
    director: "Yenny Velásquez Velázquez",
    subDirectores: "Roberto Cabrera Campos y Marcos Antonio Pérez Cabrera",
    docente: "DOCENTE ESPECIALISTA",
    tituloUnidad: "Título de la Unidad",
    bimestre: "I",
    duracion: "4 semanas",
    contexto: "Describe el contexto de la unidad...",
  });

  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<Record<string, string[]>>({});
  const [selectedTransversalCompetencies, setSelectedTransversalCompetencies] = useState<string[]>([]);
  const [selectedTransversalCapacities, setSelectedTransversalCapacities] = useState<Record<string, string[]>>({});
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);

  const filteredAreas = useMemo(() => 
    CURRICULUM_DATA.filter(a => a.levels.includes("Secundaria"))
  , []);

  const currentAreaCurriculum = useMemo(() => 
    filteredAreas.find(a => a.area === data.area) || filteredAreas[0] || CURRICULUM_DATA[0]
  , [data.area, filteredAreas]);

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
    const comp = currentAreaCurriculum.competencies.find(c => c.id === compId);
    if (!comp) return;
    
    setSelectedCapacities(prev => ({
      ...prev,
      [compId]: comp.capacities.map(c => c.id)
    }));
    
    if (!selectedCompetencies.includes(compId)) {
      setSelectedCompetencies(prev => [...prev, compId]);
    }
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

  const toggleApproach = (name: string) => {
    setSelectedApproaches(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    const compsText = currentAreaCurriculum.competencies
      .filter(c => selectedCompetencies.includes(c.id))
      .map(comp => {
        const caps = selectedCapacities[comp.id] || [];
        const capsText = caps.map(cid => comp.capacities.find(cap => cap.id === cid)?.name).join(", ");
        return `- ${comp.name} (Capacidades: ${capsText})`;
      }).join("\n");

    const transCompsText = selectedTransversalCompetencies.map(id => {
      const comp = TRANSVERSAL_COMPETENCIES.find(c => c.id === id);
      const caps = selectedTransversalCapacities[id] || [];
      const capsText = caps.map(cid => comp?.capacities.find(cap => cap.id === cid)?.name).join(", ");
      return `- ${comp?.name} (Capacidades: ${capsText})`;
    }).join("\n");

    const approachesText = selectedApproaches.join(", ");

    return `Actúa como un Especialista en Planificación Curricular del MINEDU de Perú.
Diseña una UNIDAD DE APRENDIZAJE detallada siguiendo estrictamente esta estructura:

I UNIDAD DE APRENDIZAJE

I.- DATOS INFORMATIVOS
- DRE: ${data.dre}
- UGEL: ${data.ugel}
- I.I.E.E.: ${data.institucion}
- CICLO: ${data.ciclo}
- GRADO: ${data.grado}
- DIRECTOR: ${data.director}
- SUB DIRECTORES: ${data.subDirectores}
- PROFESOR: ${data.docente}

II.- TITULO
${data.tituloUnidad}

III.- SITUACION SIGNIFICATIVA
[Redactar situación significativa basada en: ${data.contexto}]

IV.- PROPOSITOS DE APRENDIZAJE (PRESENTAR EN TABLA)
Columnas: COMPETENCIA, CAPACIDAD, ESTANDAR, CONOCIMIENTOS
USAR ESTAS COMPETENCIAS SELECCIONADAS:
${compsText || "Seleccionar automáticamente según CNEB para el área"}

V. ENFOQUES TRANSVERSALES (PRESENTAR EN TABLA)
Columnas: Derechos, ACCIONES OBSERVABLES
USAR ESTOS ENFOQUES SELECCIONADOS:
${approachesText || "Seleccionar automáticamente según CNEB"}

VI. CRITERIOS, EVIDENCIAS DE APRENDIZAJE E INSTRUMENTOS DE VALORACION (PRESENTAR EN TABLA)
Columnas: CAPACIDAD, DESEMPEÑOS PRECISADOS, CRITERIOS DE EVALUACIÓN, EVIDENCIAS DE APRENDIZAJE, INSTRUMENTO DE VALORACION
(Nota: En Desempeños, Criterios y Evidencias usar viñetas ●)

VII. SECUENCIA DE SESIONES (PRESENTAR EN TABLA)
[Diseñar secuencia lógica de sesiones]

VIII. MATERIALES ESPACIOS Y RECURSOS (PRESENTAR EN TABLA)
Columnas: Materiales, Espacio educativo, Audiovisual, Procedimiento (bajo el encabezado RECURSOS)

IX.- BIBLIOGRAFÍA Y/O REFERENCIAS
[Listar bibliografía en formato APA]

X. COMPETENCIAS TRANSVERSALES:
${transCompsText || "Seleccionar automáticamente según CNEB"}

Asegúrate de que todo el contenido esté alineado al Currículo Nacional de la Educación Básica (CNEB) vigente.

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
      console.error("Error generating unit:", error);
      alert("Error al generar la unidad. Por favor, intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent || generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1e293b] text-white px-10 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Layout className="w-5 h-5 text-indigo-400" />
            <h2 className="text-[12px] font-black uppercase tracking-widest">Planificación Curricular</h2>
          </div>
          <h3 className="text-2xl font-black uppercase">Generador de Unidades</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Crea unidades de aprendizaje estructuradas</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DRE</label>
              <input 
                type="text" 
                value={data.dre}
                onChange={(e) => setData({...data, dre: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UGEL</label>
              <input 
                type="text" 
                value={data.ugel}
                onChange={(e) => setData({...data, ugel: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institución Educativa</label>
              <input 
                type="text" 
                value={data.institucion}
                onChange={(e) => setData({...data, institucion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Director</label>
              <input 
                type="text" 
                value={data.director}
                onChange={(e) => setData({...data, director: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sub Directores</label>
              <input 
                type="text" 
                value={data.subDirectores}
                onChange={(e) => setData({...data, subDirectores: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área</label>
              <select 
                value={data.area}
                onChange={(e) => setData({...data, area: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                {AREAS_SECUNDARIA.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ciclo</label>
              <input 
                type="text" 
                value={data.ciclo}
                onChange={(e) => setData({...data, ciclo: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grado</label>
              <select 
                value={data.grado}
                onChange={(e) => setData({...data, grado: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              >
                {GRADOS.map(g => <option key={g} value={g}>{g} Grado</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sección</label>
              <input 
                type="text" 
                value={data.seccion}
                onChange={(e) => setData({...data, seccion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título de la Unidad</label>
              <input 
                type="text" 
                value={data.tituloUnidad}
                onChange={(e) => setData({...data, tituloUnidad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contexto / Situación Significativa</label>
              <textarea 
                value={data.contexto}
                onChange={(e) => setData({...data, contexto: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-600/20 min-h-[100px]"
              />
            </div>
          </div>

          <div className="space-y-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
                <span className="w-6 h-6 bg-indigo-600 rounded-lg"></span>
                Competencias y Capacidades: {currentAreaCurriculum.area}
              </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentAreaCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 ${
                  selectedCompetencies.includes(comp.id) 
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/5 ring-4 ring-indigo-500/5' 
                    : 'border-slate-100 hover:border-indigo-200 hover:shadow-lg'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <label className="flex items-start gap-4 cursor-pointer group flex-1">
                      <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                        selectedCompetencies.includes(comp.id) 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'border-slate-300 group-hover:border-indigo-400'
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
                          selectedCompetencies.includes(comp.id) ? 'text-slate-900' : 'text-slate-600 group-hover:text-indigo-600'
                        }`}>
                          {comp.name}
                        </span>
                      </div>
                    </label>
                    
                    {selectedCompetencies.includes(comp.id) && (
                      <button 
                        onClick={() => selectAllCapacities(comp.id)}
                        className="shrink-0 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white border border-indigo-200 px-3 py-1.5 rounded-full transition-all"
                      >
                        Todas
                      </button>
                    )}
                  </div>
                  
                  {selectedCompetencies.includes(comp.id) && (
                    <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 gap-3">
                        {comp.capacities.map(cap => (
                          <label key={cap.id} className={`flex items-start gap-3 cursor-pointer group/cap p-3 rounded-xl transition-all ${
                            (selectedCapacities[comp.id] || []).includes(cap.id)
                              ? 'bg-indigo-50/50 border border-indigo-100'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={(selectedCapacities[comp.id] || []).includes(cap.id)}
                              onChange={() => toggleCapacity(comp.id, cap.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <span className={`text-xs font-bold transition-colors leading-tight ${
                              (selectedCapacities[comp.id] || []).includes(cap.id)
                                ? 'text-indigo-900'
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

          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
              <span className="w-6 h-6 bg-indigo-600 rounded-lg"></span>
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
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{comp.name}</span>
                    </label>
                    
                    {selectedTransversalCompetencies.includes(comp.id) && (
                      <button 
                        onClick={() => selectAllTransversalCapacities(comp.id)}
                        className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-600 hover:text-white border border-indigo-200 px-3 py-1.5 rounded-full transition-all"
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

          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
              <span className="w-6 h-6 bg-emerald-600 rounded-lg"></span>
              Enfoques Transversales
            </h4>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRANSVERSAL_APPROACHES.map(app => (
                <label key={app} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedApproaches.includes(app)}
                    onChange={() => toggleApproach(app)}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                  />
                  <span className="text-xs font-black text-slate-600 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{app}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex items-center justify-center gap-3 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                isGenerating 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  GENERANDO...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  GENERAR UNIDAD CON IA
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all border-2 ${
                copied 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'COPIADO' : 'COPIAR PROMPT'}
            </button>
          </div>
        </div>
      </section>

      {generatedContent && (
        <section className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
          <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Unidad de Aprendizaje Generada
            </h3>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div className="p-10">
            <div className="markdown-body prose prose-slate max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>
                {generatedContent}
              </Markdown>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default UnitsGenerator;
