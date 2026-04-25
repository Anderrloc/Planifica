import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const GRADOS_POR_NIVEL: Record<string, string[]> = {
  "Inicial": ["3 años", "4 años", "5 años"],
  "Primaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"],
  "Secundaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"]
};
const AÑOS = ["2025", "2026", "2027"];
const DIFICULTADES = ["Básico", "Intermedio", "Avanzado", "Reto Científico"];
const TIPOS_ACTIVIDADES = [
  "Cuestionario de Indagación",
  "Guía de Práctica de Laboratorio",
  "Ejercicios de Aplicación de Conceptos",
  "Análisis de Casos Científicos",
  "Diseño de Prototipos Tecnológicos",
  "Preguntas de Opción Múltiple (Tipo ECE/PISA)",
  "Retos de Pensamiento Crítico"
];

const ScienceTechnologyGenerator: React.FC = () => {
  const [data, setData] = useState({
    institucion: "I.E. SEÑOR DE HUAMANTANGA N°16081",
    area: "Ciencia y Tecnología",
    grado: GRADOS_POR_NIVEL["Secundaria"][0],
    nivel: "Secundaria",
    docente: "DOCENTE ESPECIALISTA",
    año: "2026",
    temaCiencia: "El método científico y la célula",
    cantidadActividades: 10,
    dificultad: "Intermedio",
    tipoActividad: TIPOS_ACTIVIDADES[0],
    contexto: "Actividades enfocadas en la observación del entorno natural y biodiversidad local.",
  });

  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<Record<string, string[]>>({});
  const [selectedTransversalCompetencies, setSelectedTransversalCompetencies] = useState<string[]>([]);
  const [selectedTransversalCapacities, setSelectedTransversalCapacities] = useState<Record<string, string[]>>({});
  const [selectedApproaches, setSelectedApproaches] = useState<string[]>([]);

  const filteredAreas = useMemo(() => 
    CURRICULUM_DATA.filter(a => a.levels.includes(data.nivel))
  , [data.nivel]);

  const scienceCurriculum = useMemo(() => 
    filteredAreas.find(a => a.area === "Ciencia y Tecnología") || CURRICULUM_DATA.find(a => a.area === "Ciencia y Tecnología") || CURRICULUM_DATA[0]
  , [filteredAreas]);

  const handleLevelChange = (nivel: string) => {
    const newGrado = GRADOS_POR_NIVEL[nivel][0];
    setData({
      ...data,
      nivel,
      grado: newGrado,
    });
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
    const comp = scienceCurriculum.competencies.find(c => c.id === compId);
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

  const generatePrompt = () => {
    const compsText = scienceCurriculum.competencies
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

    return `Actúa como un Especialista en Didáctica de Ciencia y Tecnología del MINEDU de Perú. 
Diseña una FICHA DE ACTIVIDADES DE CIENCIA Y TECNOLOGÍA detallada para el año escolar ${data.año}.

TEMA: ${data.temaCiencia}
TIPO DE ACTIVIDAD: ${data.tipoActividad}
CANTIDAD DE PREGUNTAS/EJERCICIOS: ${data.cantidadActividades}
NIVEL DE DIFICULTAD: ${data.dificultad}
CONTEXTO: ${data.contexto}

I. DATOS INFORMATIVOS
- Institución Educativa: ${data.institucion}
- Área: Ciencia y Tecnología
- Grado y Sección: ${data.grado}
- Nivel: ${data.nivel}
- Docente: ${data.docente}

II. PROPÓSITOS DE APRENDIZAJE (Alineado al CNEB)
Competencias y Capacidades:
${compsText || "Seleccionar automáticamente según el tema"}

Competencias Transversales:
${transCompsText || "Seleccionar automáticamente según CNEB"}

Enfoques Transversales: ${approachesText || "Seleccionar automáticamente según CNEB"}

III. ESTRUCTURA DE LA FICHA
1. Breve introducción teórica, fundamentos científicos o planteamiento del problema.
2. Conceptos clave y vocabulario científico.
3. Bloque de actividades propuestos (${data.cantidadActividades} ítems) del tipo "${data.tipoActividad}".
4. Sección de experimentación, indagación o diseño (según la competencia).
5. Preguntas de reflexión y autoevaluación.

IV. REQUERIMIENTOS TÉCNICOS
- Las actividades deben promover el pensamiento científico y la curiosidad.
- Incluye las claves de respuesta o criterios de evaluación al final para el docente.
- Asegúrate de que el lenguaje sea preciso y científicamente correcto.
- Utiliza ejemplos reales y aplicaciones tecnológicas actuales.

Presenta el contenido de forma organizada y lista para ser copiada a un procesador de textos.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-emerald-900 text-white px-10 py-8">
          <h2 className="text-[12px] font-black text-emerald-300 uppercase tracking-widest mb-2">Generador de Actividades</h2>
          <h3 className="text-2xl font-black uppercase">Ciencia y Tecnología</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Crea fichas de ciencia personalizadas alineadas al CNEB</p>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tema de Ciencia y Tecnología</label>
              <input 
                type="text" 
                value={data.temaCiencia}
                onChange={(e) => setData({...data, temaCiencia: e.target.value})}
                className="w-full bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
                placeholder="Ej: El sistema digestivo, Leyes de Newton, etc."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Actividad</label>
              <select 
                value={data.tipoActividad}
                onChange={(e) => setData({...data, tipoActividad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none"
              >
                {TIPOS_ACTIVIDADES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cantidad de Actividades/Preguntas</label>
              <input 
                type="number" 
                value={data.cantidadActividades}
                onChange={(e) => setData({...data, cantidadActividades: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Dificultad</label>
              <select 
                value={data.dificultad}
                onChange={(e) => setData({...data, dificultad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none"
              >
                {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
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

          <div className="space-y-8">
            <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
              <span className="w-6 h-6 bg-emerald-600 rounded-lg"></span>
              Competencias y Capacidades de Ciencia y Tecnología
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scienceCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 ${
                  selectedCompetencies.includes(comp.id) 
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/5 ring-4 ring-emerald-500/5' 
                    : 'border-slate-100 hover:border-emerald-200'
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
                      <span className={`text-sm font-black leading-tight transition-colors ${
                        selectedCompetencies.includes(comp.id) ? 'text-slate-900' : 'text-slate-600 group-hover:text-emerald-600'
                      }`}>
                        {comp.name}
                      </span>
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
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                      {comp.capacities.map(cap => (
                        <label key={cap.id} className="flex items-start gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={(selectedCapacities[comp.id] || []).includes(cap.id)}
                            onChange={() => toggleCapacity(comp.id, cap.id)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
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
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{comp.name}</span>
                    </label>
                    
                    {selectedTransversalCompetencies.includes(comp.id) && (
                      <button 
                        onClick={() => selectAllTransversalCapacities(comp.id)}
                        className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-600 hover:text-white border border-emerald-200 px-3 py-1.5 rounded-full transition-all"
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
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contexto / Situación de las Actividades</label>
            <textarea 
              value={data.contexto}
              onChange={(e) => setData({...data, contexto: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-600/20 min-h-[100px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="px-10 py-6 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Prompt Generado para Copiar</h3>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {copied ? '¡COPIADO!' : 'COPIAR PROMPT'}
          </button>
        </div>
        <div className="p-10">
          <pre className="bg-slate-950 p-8 rounded-2xl text-emerald-200 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
            {generatePrompt()}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default ScienceTechnologyGenerator;
