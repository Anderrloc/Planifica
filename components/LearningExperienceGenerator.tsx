
import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, FileText, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

const GRADOS = ["1°", "2°", "3°", "4°", "5°"];
const DURACION = ["3 semanas", "4 semanas", "5 semanas"];
const PERIODOS = ["Bimestre", "Trimestre"];
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
  "Educación para el Trabajo"
];
const CICLOS = [
  { id: "VI", label: "CICLO VI (Primero y Segundo)" },
  { id: "VII", label: "CICLO VII (Tercero, Cuarto y Quinto)" }
];

const EJES_POR_AREA: Record<string, string[]> = {
  "Comunicación": [
    "Ciudadanía y convivencia en la diversidad", 
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad",
    "Logros y desafíos del país en el Bicentenario"
  ],
  "Matemática": [
    "Descubrimiento e innovación", 
    "Trabajo y emprendimiento en el siglo XXI",
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad"
  ],
  "Ciencia y Tecnología": [
    "Salud y conservación ambiental", 
    "Descubrimiento e innovación", 
    "Cuidado de la salud y desarrollo de la resiliencia"
  ],
  "Ciencias Sociales": [
    "Logros y desafíos del país en el Bicentenario", 
    "Ciudadanía y convivencia en la diversidad", 
    "Ejercicio ciudadano para la reducción de riesgos, el manejo de conflictos"
  ],
  "Desarrollo Personal, Ciudadanía y Cívica": [
    "Ciudadanía y convivencia en la diversidad", 
    "Ejercicio ciudadano para la reducción de riesgos, el manejo de conflictos",
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad"
  ],
  "Arte y Cultura": [
    "Ciudadanía y convivencia en la diversidad", 
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad",
    "Descubrimiento e innovación"
  ],
  "Educación Física": [
    "Cuidado de la salud y desarrollo de la resiliencia", 
    "Salud y conservación ambiental",
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad"
  ],
  "Inglés (Lengua Extranjera)": [
    "Ciudadanía y convivencia en la diversidad", 
    "Descubrimiento e innovación",
    "Logros y desafíos del país en el Bicentenario"
  ],
  "Educación Religiosa": [
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad", 
    "Ciudadanía y convivencia en la diversidad",
    "Cuidado de la salud y desarrollo de la resiliencia"
  ],
  "Educación para el Trabajo": [
    "Trabajo y emprendimiento en el siglo XXI", 
    "Descubrimiento e innovación",
    "Convivencia y buen uso de los recursos en el entorno del hogar y la comunidad"
  ]
};

const LearningExperienceGenerator: React.FC = () => {
  const [data, setData] = useState({
    dre: "Cajamarca",
    ugel: "Jaén",
    institucion: "I.E. SEÑOR DE HUAMANTANGA N°16081",
    titulo: "PROMOVEMOS E IMPLEMENTAMOS EL DESARROLLO ECOEFICIENTE Y SOSTENIBLE EN LA INSTITUCION EDUCATIVA",
    ciclo: "VI",
    grado: "1°",
    seccion: "A, B, C",
    nivel: "Secundaria",
    periodo: "Bimestre",
    director: "Yenny Velásquez Velázquez",
    docente: "DOCENTE ESPECIALISTA",
    duracion: "4 semanas",
    año: "2026",
    eje: "Logros y desafíos del país en el Bicentenario",
    area: "Ciencias Sociales",
    contexto: "Según la ONU, el Desarrollo sostenible es la satisfacción de las necesidades de las generaciones presente sin comprometer la capacidad de las generaciones futuras. En Jaén tenemos problemas de contaminación, deforestación e inseguridad, pero también oportunidades en agricultura (café, cacao) y biodiversidad. Necesitamos implementar estrategias ambientales sostenibles mediante la investigación y emprendimiento.",
    producto: "Proyecto de ecoeficiencia institucional y feria de emprendimientos sostenibles.",
  });

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
  const [generatedEdA, setGeneratedEdA] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const generatePrompt = () => {
    const selectedCiclo = CICLOS.find(c => c.id === data.ciclo)?.label || data.ciclo;

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

    return `Actúa como un Especialista en Diseño Curricular del Ministerio de Educación (MINEDU) de Perú. 
Diseña una PROGRAMACIÓN ANUAL / EXPERIENCIA DE APRENDIZAJE ANUAL para Educación Secundaria, siguiendo estrictamente esta estructura y contenido:

I. Datos Informativos
1.1. DRE: ${data.dre}
1.2. UGEL: ${data.ugel}
1.3. IE. ${data.institucion}
1.4. Área Curricular: ${data.area}
1.5. Grado: ${data.grado} Sección: ${data.seccion}
1.6. Director: ${data.director}
1.7. Docente (s): ${data.docente}

II. Organización de las unidades didácticas :

PRIMER BIMESTRE
a. Título de unidad: [Generar título creativo]
b. Duración: [Semanas]
c. Estándar de las competencias: [Estándares CNEB para el ciclo ${data.ciclo}]
d. Situación significativa: [Redactar situación significativa basada en: ${data.contexto}]
e. Competencias, capacidades, desempeños, conocimientos, instrumentos de evaluación y tiempo
(PRESENTAR EN TABLA con columnas: Competencias, Capacidades, Desempeños, Conocimientos, Instrumento, Tiempo)
USAR ESTAS COMPETENCIAS SELECCIONADAS:
${compsText || "Seleccionar automáticamente según CNEB para el área"}

SEGUNDO BIMESTRE
a. Título de unidad: [Generar título creativo]
b. Duración: [Semanas]
c. Estándar de las competencias: [Estándares CNEB]
d. Situación significativa: [Redactar situación significativa]
e. Competencias, capacidades, desempeños, conocimientos, instrumentos de evaluación y tiempo
(PRESENTAR EN TABLA con columnas: Competencias, Capacidades, Desempeños, Conocimientos, Instrumento, Tiempo)

TERCER BIMESTRE
a. Título de unidad: [Generar título creativo]
b. Duración: [Semanas]
c. Estándar de las competencias: [Estándares CNEB]
d. Situación significativa: [Redactar situación significativa]
e. Competencias, capacidades, desempeños, conocimientos, instrumentos de evaluación y tiempo
(PRESENTAR EN TABLA con columnas: Competencias, Capacidades, Desempeños, Conocimientos, Instrumento, Tiempo)

CUARTO BIMESTRE
a. Título de unidad: [Generar título creativo]
b. Duración: [Semanas]
c. Estándar de las competencias: [Estándares CNEB]
d. Situación significativa: [Redactar situación significativa]
e. Competencias, capacidades, desempeños, conocimientos, instrumentos de evaluación y tiempo
(PRESENTAR EN TABLA con columnas: Competencias, Capacidades, Desempeños, Conocimientos, Instrumento, Tiempo)

III. Metodología:
[Describir la metodología activa a utilizar]

IV. Bibliografía o referencias bibliográficas:
[Listar bibliografía en formato APA]

V. COMPETENCIAS TRANSVERSALES:
${transCompsText || "Seleccionar automáticamente según CNEB"}

VI. ENFOQUES TRANSVERSALES:
${approachesText || "Seleccionar automáticamente según CNEB"}

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
        setGeneratedEdA(response.text);
      }
    } catch (error: any) {
      console.error("Error generating EdA:", error);
      if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
        alert("Error de API: Por favor, asegúrate de haber configurado tu API Key en el botón superior 'Configurar API'.");
      } else {
        alert("Error al generar la Experiencia de Aprendizaje. Por favor, intenta de nuevo.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAreaChange = (newArea: string) => {
    const suggestedEjes = EJES_POR_AREA[newArea] || [];
    setData({ 
      ...data, 
      area: newArea,
      eje: suggestedEjes.length > 0 ? suggestedEjes[0] : data.eje 
    });
  };

  const handleGradoChange = (newGrado: string) => {
    const newCiclo = (newGrado === "1°" || newGrado === "2°") ? "VI" : "VII";
    setData({ ...data, grado: newGrado, ciclo: newCiclo });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEdA || generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0a1128] text-white px-10 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="text-[12px] font-black uppercase tracking-widest">Planificación Curricular</h2>
          </div>
          <h3 className="text-2xl font-black uppercase">Experiencia de Aprendizaje (EdA)</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Diseño integrado multi-áreas para secundaria</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Título de la Experiencia</label>
              <input 
                type="text" 
                value={data.titulo}
                onChange={(e) => setData({...data, titulo: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DRE</label>
              <input 
                type="text" 
                value={data.dre}
                onChange={(e) => setData({...data, dre: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">UGEL</label>
              <input 
                type="text" 
                value={data.ugel}
                onChange={(e) => setData({...data, ugel: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Director</label>
              <input 
                type="text" 
                value={data.director}
                onChange={(e) => setData({...data, director: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Docente Responsable</label>
              <input 
                type="text" 
                value={data.docente}
                onChange={(e) => setData({...data, docente: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sección</label>
              <input 
                type="text" 
                value={data.seccion}
                onChange={(e) => setData({...data, seccion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área a Desarrollar (Principal)</label>
              <select 
                value={data.area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
              >
                {AREAS_SECUNDARIA.map(area => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel</label>
              <select 
                value={data.nivel}
                onChange={(e) => setData({...data, nivel: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
              >
                <option value="Secundaria">Secundaria</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grado / Ciclo</label>
              <div className="flex gap-2">
                <select 
                  value={data.grado}
                  onChange={(e) => handleGradoChange(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
                >
                  {GRADOS.map(g => <option key={g} value={g}>{g} Grado</option>)}
                </select>
                <div className="flex-1 bg-slate-100 border border-slate-200 p-4 rounded-xl text-sm font-bold text-slate-500 flex items-center justify-center">
                  Ciclo {data.ciclo}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Periodo</label>
              <select 
                value={data.periodo}
                onChange={(e) => setData({...data, periodo: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
              >
                {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eje Temático (CNEB - MINEDU)</label>
              <div className="relative">
                <input 
                  type="text"
                  list="ejes-list"
                  value={data.eje}
                  onChange={(e) => setData({...data, eje: e.target.value})}
                  placeholder="Selecciona o escribe el eje temático..."
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <datalist id="ejes-list">
                  {(EJES_POR_AREA[data.area] || []).map(eje => <option key={eje} value={eje} />)}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duración</label>
              <select 
                value={data.duracion}
                onChange={(e) => setData({...data, duracion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 appearance-none"
              >
                {DURACION.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Año</label>
              <input 
                type="text" 
                value={data.año}
                onChange={(e) => setData({...data, año: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Producto Final de la EdA</label>
              <input 
                type="text" 
                value={data.producto}
                onChange={(e) => setData({...data, producto: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="Ej: Un periódico mural, una campaña de reciclaje..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Situación / Contexto</label>
              <textarea 
                value={data.contexto}
                onChange={(e) => setData({...data, contexto: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600/20 min-h-[100px]"
                placeholder="Describe la problemática o necesidad de los estudiantes..."
              />
            </div>
          </div>

          <div className="space-y-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-600 rounded-lg"></span>
                Competencias y Capacidades: {currentAreaCurriculum.area}
              </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentAreaCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 ${
                  selectedCompetencies.includes(comp.id) 
                    ? 'border-blue-500 shadow-xl shadow-blue-500/5 ring-4 ring-blue-500/5' 
                    : 'border-slate-100 hover:border-blue-200 hover:shadow-lg'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <label className="flex items-start gap-4 cursor-pointer group flex-1">
                      <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                        selectedCompetencies.includes(comp.id) 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-slate-300 group-hover:border-blue-400'
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
                          selectedCompetencies.includes(comp.id) ? 'text-slate-900' : 'text-slate-600 group-hover:text-blue-600'
                        }`}>
                          {comp.name}
                        </span>
                      </div>
                    </label>
                    
                    {selectedCompetencies.includes(comp.id) && (
                      <button 
                        onClick={() => selectAllCapacities(comp.id)}
                        className="shrink-0 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-600 hover:text-white border border-blue-200 px-3 py-1.5 rounded-full transition-all"
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
                              ? 'bg-blue-50/50 border border-blue-100'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={(selectedCapacities[comp.id] || []).includes(cap.id)}
                              onChange={() => toggleCapacity(comp.id, cap.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span className={`text-xs font-bold transition-colors leading-tight ${
                              (selectedCapacities[comp.id] || []).includes(cap.id)
                                ? 'text-blue-900'
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
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  GENERANDO EXPERIENCIA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  DISEÑAR EXPERIENCIA CON IA
                </>
              )}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generatePrompt());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all border-2 ${
                copied 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'PROMPT COPIADO' : 'COPIAR PROMPT'}
            </button>
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prompt que se enviará a la IA</h4>
            </div>
            <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto">
              {generatePrompt()}
            </pre>
          </div>
        </div>
      </section>

      {generatedEdA && (
        <section className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-fade-in">
          <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Experiencia de Aprendizaje Generada
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
                {generatedEdA}
              </Markdown>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LearningExperienceGenerator;
