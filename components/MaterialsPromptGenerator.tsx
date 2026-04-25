
import React, { useState, useMemo } from 'react';
import { CURRICULUM_DATA, TRANSVERSAL_COMPETENCIES, TRANSVERSAL_APPROACHES } from '../src/data/curriculum';

const NIVELES = ["Inicial", "Primaria", "Secundaria"];
const GRADOS_POR_NIVEL: Record<string, string[]> = {
  "Inicial": ["3 años", "4 años", "5 años"],
  "Primaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado", "6° Grado"],
  "Secundaria": ["1° Grado", "2° Grado", "3° Grado", "4° Grado", "5° Grado"]
};
const AÑOS = ["2025", "2026", "2027"];
const TIPOS_MATERIAL = [
  "Ficha de Trabajo",
  "Ficha Informativa",
  "Guía de Aprendizaje",
  "Infografía Textual",
  "Resumen Científico",
  "Estudio de Caso",
  "Lectura Comprensiva",
  "Organizador Visual",
  "Diapositivas (Estructura)",
  "Guion de Podcast/Video"
];

const MaterialsPromptGenerator: React.FC = () => {
  const [data, setData] = useState({
    institucion: "I.E. SEÑOR DE HUAMANTANGA N°16081",
    area: CURRICULUM_DATA.find(a => a.levels.includes("Secundaria"))?.area || CURRICULUM_DATA[0].area,
    grado: GRADOS_POR_NIVEL["Secundaria"][0],
    nivel: "Secundaria",
    docente: "DOCENTE ESPECIALISTA",
    año: "2026",
    nombreUnidad: "Fortalecemos nuestra identidad local en un mundo globalizado",
    nombreSesion: "Identificamos las características de nuestra comunidad",
    tipoMaterial: TIPOS_MATERIAL[0],
    temaEspecifico: "La historia y tradiciones de nuestra localidad",
    proposito: "Que los estudiantes comprendan la importancia de sus raíces culturales."
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

    return `Actúa como un Especialista en Diseño de Materiales Educativos del Ministerio de Educación (MINEDU) de Perú. 
Diseña un MATERIAL EDUCATIVO del tipo "${data.tipoMaterial}" para el año escolar ${data.año}.

I. DATOS INFORMATIVOS
- Institución Educativa: ${data.institucion}
- Área Curricular: ${data.area}
- Grado y Sección: ${data.grado}
- Nivel: ${data.nivel}
- Docente Responsable: ${data.docente}
- Unidad de Aprendizaje: ${data.nombreUnidad}
- Sesión de Aprendizaje: ${data.nombreSesion}

II. PROPÓSITOS DE APRENDIZAJE
Competencias y capacidades seleccionadas:
${compsText || "Seleccionar automáticamente según CNEB basándose en el tema"}

Competencias Transversales:
${transCompsText || "Seleccionar automáticamente según CNEB"}

Enfoques Transversales: ${approachesText || "Seleccionar automáticamente según CNEB"}

III. ESPECIFICACIONES DEL MATERIAL
- Tipo de Material: ${data.tipoMaterial}
- Tema Específico: ${data.temaEspecifico}
- Propósito Didáctico: ${data.proposito}

IV. REQUERIMIENTOS DE DISEÑO
1. Estructura el contenido de forma lógica, atractiva y pedagógica.
2. Incluye una sección de "Saberes Previos" o "Conflicto Cognitivo" al inicio.
3. Desarrolla el contenido principal con lenguaje claro y adecuado para la edad de los estudiantes.
4. Incluye actividades prácticas o retos que permitan movilizar las capacidades seleccionadas.
5. Si es una Ficha o Guía, incluye espacios para que el estudiante responda o trabaje.
6. Asegúrate de que el diseño promueva el aprendizaje autónomo y el pensamiento crítico.

Asegúrate de que todo el contenido esté alineado al Currículo Nacional de la Educación Básica (CNEB) vigente.`;
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
          <h2 className="text-[12px] font-black text-emerald-400 uppercase tracking-widest mb-2">Generador de Prompts</h2>
          <h3 className="text-2xl font-black uppercase">Materiales Educativos</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Configura los datos para obtener un prompt de material didáctico profesional</p>
        </div>

        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo de Material</label>
              <select 
                value={data.tipoMaterial}
                onChange={(e) => setData({...data, tipoMaterial: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20 appearance-none"
              >
                {TIPOS_MATERIAL.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Unidad</label>
              <input 
                type="text" 
                value={data.nombreUnidad}
                onChange={(e) => setData({...data, nombreUnidad: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Sesión</label>
              <input 
                type="text" 
                value={data.nombreSesion}
                onChange={(e) => setData({...data, nombreSesion: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tema Específico del Material</label>
              <input 
                type="text" 
                value={data.temaEspecifico}
                onChange={(e) => setData({...data, temaEspecifico: e.target.value})}
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
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-3">
                <span className="w-6 h-6 bg-indigo-600 rounded-lg"></span>
                Competencias y Capacidades: {currentAreaCurriculum.area}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNEB - PERÚ</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentAreaCurriculum.competencies.map(comp => (
                <div key={comp.id} className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 group/card ${
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
                        {!selectedCompetencies.includes(comp.id) && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click para ver capacidades</span>
                        )}
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
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Capacidades Seleccionadas</h5>
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
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Propósito Didáctico / Meta de Aprendizaje</label>
            <textarea 
              value={data.proposito}
              onChange={(e) => setData({...data, proposito: e.target.value})}
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
          <pre className="bg-slate-950 p-8 rounded-2xl text-emerald-200 text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
            {generatePrompt()}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default MaterialsPromptGenerator;
