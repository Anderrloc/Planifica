
import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const GRADOS_POR_NIVEL: Record<string, string[]> = {
  "Inicial": ["3 años", "4 años", "5 años"],
  "Primaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"],
  "Secundaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"]
};
const AÑOS = ["2025", "2026", "2027"];
const INSTRUMENTOS = [
  "Lista de Cotejo",
  "Rúbrica Holística",
  "Rúbrica Analítica",
  "Escala de Valoración",
  "Ficha de Observación",
  "Guía de Entrevista",
  "Portafolio de Evidencias"
];

const EvaluationInstrumentGenerator: React.FC = () => {
  const [data, setData] = useState({
    institucion: "I.E. SEÑOR DE HUAMANTANGA N°16081",
    area: CURRICULUM_DATA.find(a => a.levels.includes("Secundaria"))?.area || CURRICULUM_DATA[0].area,
    grado: GRADOS_POR_NIVEL["Secundaria"][0],
    nivel: "Secundaria",
    docente: "DOCENTE ESPECIALISTA",
    año: "2026",
    instrumento: INSTRUMENTOS[0],
    nombreUnidad: "Fortalecemos nuestra identidad local en un mundo globalizado",
    nombreSesion: "Identificamos las características de nuestra comunidad",
    criterios: "Capacidad de identificar elementos culturales propios, uso de vocabulario pertinente, coherencia en la exposición.",
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

    return `Actúa como un Especialista en Evaluación Educativa del Ministerio de Educación (MINEDU) de Perú. 
Antes de diseñar el instrumento, realiza un breve ANÁLISIS DE LA EVALUACIÓN respondiendo a las siguientes preguntas:
1. ¿Qué competencia evalúo?
2. ¿Qué capacidad evalúo?
3. ¿Qué desempeño del grado evalúo?
4. ¿Qué evidencia recogeré?
5. ¿Qué criterios usaré?
6. ¿Qué instrumento es el más adecuado? (Justifica por qué "${data.instrumento}" es pertinente).

Luego, diseña el INSTRUMENTO DE EVALUACIÓN del tipo "${data.instrumento}" para el año escolar ${data.año} siguiendo estrictamente esta estructura y PRESENTANDO LA INFORMACIÓN EN TABLAS:

I. DATOS INFORMATIVOS
- Institución Educativa: ${data.institucion}
- Área Curricular: ${data.area}
- Grado y Sección: ${data.grado}
- Nivel: ${data.nivel}
- Docente Responsable: ${data.docente}
- Unidad de Aprendizaje: ${data.nombreUnidad}
- Sesión de Aprendizaje: ${data.nombreSesion}
- Instrumento: ${data.instrumento}

II. MATRIZ DE EVALUACIÓN (PRESENTAR EN TABLA)
Crea una tabla que vincule:
1. Competencias del área seleccionadas:
${compsText || "Seleccionar automáticamente según CNEB"}
2. Competencias Transversales:
${transCompsText || "Seleccionar automáticamente según CNEB"}
3. Enfoques Transversales: ${approachesText || "Seleccionar automáticamente según CNEB"}
4. Capacidades evaluadas.
5. Desempeños precisos.
6. Criterios de Evaluación (basados en: ${data.criterios}).

III. DISEÑO DEL INSTRUMENTO: ${data.instrumento} (PRESENTAR EN TABLA)
Diseña el instrumento siguiendo la estructura técnica más adecuada para el tipo "${data.instrumento}":

- Si es LISTA DE COTEJO: Crea una tabla de doble entrada. Columnas: Ítems/Indicadores de logro (mínimo 5), VALORACIÓN (SÍ/NO) y OBSERVACIONES.
- Si es RÚBRICA ANALÍTICA: 
  1. Primero, presenta la MATRIZ DE LA RÚBRICA con columnas: CRITERIOS DE EVALUACIÓN y NIVELES DE LOGRO (INICIO, PROCESO, LOGRADO, DESTACADO) con descriptores precisos y diferenciados.
  2. Segundo, presenta el CUADRO DE REGISTRO PARA EL DOCENTE con columnas: CRITERIO 1, CRITERIO 2, ..., PUNTAJE TOTAL y NIVEL DE LOGRO ALCANZADO.
- Si es RÚBRICA HOLÍSTICA: Crea una tabla con los NIVELES DE LOGRO y la descripción global del desempeño esperado para cada nivel, seguida del cuadro de registro.
- Si es ESCALA DE VALORACIÓN: Crea una tabla con columnas: INDICADORES DE LOGRO y una escala cualitativa (ej. Siempre, A veces, Nunca o Inicio, Proceso, Logrado).
- Si es FICHA DE OBSERVACIÓN: Diseña una tabla con indicadores específicos de comportamiento o habilidades a observar durante la sesión, con espacio para comentarios detallados.

IMPORTANTE: El formato de las tablas debe ser impecable y profesional.

IV. ORIENTACIONES PARA LA RETROALIMENTACIÓN
Propón 3 preguntas clave para realizar una retroalimentación reflexiva basada en los resultados de este instrumento.

Asegúrate de que todo el contenido esté alineado al enfoque de evaluación formativa del CNEB y que el formato de tablas sea impecable.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-10 py-8">
          <h2 className="text-[12px] font-black text-amber-400 uppercase tracking-widest mb-2">Generador de Prompts</h2>
          <h3 className="text-2xl font-black uppercase">Instrumento de Evaluación</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Configura los datos para obtener un prompt de evaluación profesional</p>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Instrumento</label>
              <select 
                value={data.instrumento}
                onChange={(e) => setData({...data, instrumento: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20 appearance-none"
              >
                {INSTRUMENTOS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Unidad</label>
              <input 
                type="text" 
                value={data.nombreUnidad}
                onChange={(e) => setData({...data, nombreUnidad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Sesión</label>
              <input 
                type="text" 
                value={data.nombreSesion}
                onChange={(e) => setData({...data, nombreSesion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Institución Educativa</label>
              <input 
                type="text" 
                value={data.institucion}
                onChange={(e) => setData({...data, institucion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel / Grado</label>
              <div className="flex gap-2">
                <select 
                  value={data.nivel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20 appearance-none"
                >
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select 
                  value={data.grado}
                  onChange={(e) => setData({...data, grado: e.target.value})}
                  className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20 appearance-none"
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
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20 appearance-none"
              >
                {filteredAreas.map(a => <option key={a.area} value={a.area}>{a.area}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Año</label>
              <select 
                value={data.año}
                onChange={(e) => setData({...data, año: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/20 text-center appearance-none"
              >
                {AÑOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
                <span className="w-6 h-6 bg-amber-600 rounded-lg"></span>
                Competencias y Capacidades: {currentAreaCurriculum.area}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNEB - PERÚ</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentAreaCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 group/card ${
                  selectedCompetencies.includes(comp.id) 
                    ? 'border-amber-500 shadow-xl shadow-amber-500/5 ring-4 ring-amber-500/5' 
                    : 'border-slate-100 hover:border-amber-200 hover:shadow-lg'
                }`}>
                  <div className="flex justify-between items-start gap-4">
                    <label className="flex items-start gap-4 cursor-pointer group flex-1">
                      <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                        selectedCompetencies.includes(comp.id) 
                          ? 'bg-amber-600 border-amber-600' 
                          : 'border-slate-300 group-hover:border-amber-400'
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
                          selectedCompetencies.includes(comp.id) ? 'text-slate-900' : 'text-slate-600 group-hover:text-amber-600'
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
                        className="shrink-0 text-[9px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-600 hover:text-white border border-amber-200 px-3 py-1.5 rounded-full transition-all"
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
                              ? 'bg-amber-50/50 border border-amber-100'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}>
                            <input 
                              type="checkbox" 
                              checked={(selectedCapacities[comp.id] || []).includes(cap.id)}
                              onChange={() => toggleCapacity(comp.id, cap.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-600"
                            />
                            <span className={`text-xs font-bold transition-colors leading-tight ${
                              (selectedCapacities[comp.id] || []).includes(cap.id)
                                ? 'text-amber-900'
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Criterios de Evaluación / Desempeños a Observar</label>
            <textarea 
              value={data.criterios}
              onChange={(e) => setData({...data, criterios: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-600/20 min-h-[100px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
        <div className="px-10 py-6 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Prompt Generado para Copiar</h3>
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-amber-600 text-white hover:bg-amber-500'
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
        <div className="p-10">
          <pre className="bg-slate-950 p-8 rounded-2xl text-amber-200 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
            {generatePrompt()}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default EvaluationInstrumentGenerator;
