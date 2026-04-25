
export interface Capacity {
  id: string;
  name: string;
}

export interface Competency {
  id: string;
  name: string;
  capacities: Capacity[];
}

export interface AreaCurriculum {
  area: string;
  levels: string[]; // ["Inicial", "Primaria", "Secundaria"]
  competencies: Competency[];
}

export const TRANSVERSAL_COMPETENCIES: Competency[] = [
  {
    id: "tc1",
    name: "Se desenvuelve en los entornos virtuales generados por las TIC",
    capacities: [
      { id: "tc1c1", name: "Personaliza entornos virtuales" },
      { id: "tc1c2", name: "Gestiona información del entorno virtual" },
      { id: "tc1c3", name: "Interactúa en entornos virtuales" },
      { id: "tc1c4", name: "Crea objetos virtuales en diversos formatos" }
    ]
  },
  {
    id: "tc2",
    name: "Gestiona su aprendizaje de manera autónoma",
    capacities: [
      { id: "tc2c1", name: "Define metas de aprendizaje" },
      { id: "tc2c2", name: "Organiza acciones estratégicas para alcanzar sus metas de aprendizaje" },
      { id: "tc2c3", name: "Monitorea y ajusta su desempeño durante el proceso de aprendizaje" }
    ]
  }
];

export const TRANSVERSAL_APPROACHES = [
  "Enfoque de Derechos",
  "Enfoque Inclusivo o de Atención a la diversidad",
  "Enfoque Intercultural",
  "Enfoque Igualdad de Género",
  "Enfoque Ambiental",
  "Enfoque Orientación al bien común",
  "Enfoque Búsqueda de la Excelencia"
];

export const CURRICULUM_DATA: AreaCurriculum[] = [
  // --- NIVEL INICIAL ---
  {
    area: "Comunicación",
    levels: ["Inicial"],
    competencies: [
      {
        id: "i_com1",
        name: "Se comunica oralmente en su lengua materna",
        capacities: [
          { id: "i_com1c1", name: "Obtiene información del texto oral" },
          { id: "i_com1c2", name: "Infiere e interpreta información del texto oral" },
          { id: "i_com1c3", name: "Adecúa, organiza y desarrolla el texto de forma coherente y cohesionada" },
          { id: "i_com1c4", name: "Utiliza recursos no verbales y paraverbales de forma estratégica" },
          { id: "i_com1c5", name: "Interactúa estratégicamente con distintos interlocutores" },
          { id: "i_com1c6", name: "Reflexiona y evalúa la forma, el contenido y contexto del texto oral" }
        ]
      },
      {
        id: "i_com2",
        name: "Lee diversos tipos de textos escritos en su lengua materna",
        capacities: [
          { id: "i_com2c1", name: "Obtiene información del texto escrito" },
          { id: "i_com2c2", name: "Infiere e interpreta información del texto" },
          { id: "i_com2c3", name: "Reflexiona y evalúa la forma, el contenido y contexto del texto" }
        ]
      },
      {
        id: "i_com3",
        name: "Escribe diversos tipos de textos en su lengua materna",
        capacities: [
          { id: "i_com3c1", name: "Adecúa el texto a la situación comunicativa" },
          { id: "i_com3c2", name: "Organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "i_com3c3", name: "Utiliza convenciones del lenguaje escrito de forma pertinente" },
          { id: "i_com3c4", name: "Reflexiona y evalúa la forma, el contenido y contexto del texto escrito" }
        ]
      },
      {
        id: "i_com4",
        name: "Crea proyectos desde los lenguajes artísticos",
        capacities: [
          { id: "i_com4c1", name: "Explora y experimenta los lenguajes del arte" },
          { id: "i_com4c2", name: "Aplica procesos creativos" },
          { id: "i_com4c3", name: "Socializa sus procesos y proyectos" }
        ]
      }
    ]
  },
  {
    area: "Matemática",
    levels: ["Inicial"],
    competencies: [
      {
        id: "i_mat1",
        name: "Resuelve problemas de cantidad",
        capacities: [
          { id: "i_mat1c1", name: "Traduce cantidades a expresiones numéricas" },
          { id: "i_mat1c2", name: "Comunica su comprensión sobre los números y las operaciones" },
          { id: "i_mat1c3", name: "Usa estrategias y procedimientos de estimación y cálculo" }
        ]
      },
      {
        id: "i_mat2",
        name: "Resuelve problemas de forma, movimiento y localización",
        capacities: [
          { id: "i_mat2c1", name: "Modela objetos con formas geométricas y sus transformaciones" },
          { id: "i_mat2c2", name: "Comunica su comprensión sobre las formas y relaciones geométricas" },
          { id: "i_mat2c3", name: "Usa estrategias y procedimientos para orientarse en el espacio" }
        ]
      }
    ]
  },
  {
    area: "Personal Social",
    levels: ["Inicial"],
    competencies: [
      {
        id: "i_ps1",
        name: "Construye su identidad",
        capacities: [
          { id: "i_ps1c1", name: "Se valora a sí mismo" },
          { id: "i_ps1c2", name: "Autorregula sus emociones" }
        ]
      },
      {
        id: "i_ps2",
        name: "Convive y participa democráticamente en la búsqueda del bien común",
        capacities: [
          { id: "i_ps2c1", name: "Interactúa con todas las personas" },
          { id: "i_ps2c2", name: "Construye normas y asume acuerdos y leyes" },
          { id: "i_ps2c3", name: "Participa en acciones que promueven el bienestar común" }
        ]
      },
      {
        id: "i_ps3",
        name: "Construye su identidad, como persona humana, amada por Dios, digna, libre y trascendente...",
        capacities: [
          { id: "i_ps3c1", name: "Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente" },
          { id: "i_ps3c2", name: "Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa" }
        ]
      }
    ]
  },
  {
    area: "Ciencia y Tecnología",
    levels: ["Inicial"],
    competencies: [
      {
        id: "i_ct1",
        name: "Indaga mediante métodos científicos para construir sus conocimientos",
        capacities: [
          { id: "i_ct1c1", name: "Problematiza situaciones para hacer indagación" },
          { id: "i_ct1c2", name: "Diseña estrategias para hacer indagación" },
          { id: "i_ct1c3", name: "Genera y registra datos o información" },
          { id: "i_ct1c4", name: "Analiza datos e información" },
          { id: "i_ct1c5", name: "Evalúa y comunica el proceso y resultado de su indagación" }
        ]
      }
    ]
  },
  {
    area: "Psicomotriz",
    levels: ["Inicial"],
    competencies: [
      {
        id: "i_psi1",
        name: "Se desenvuelve de manera autónoma a través de su motricidad",
        capacities: [
          { id: "i_psi1c1", name: "Comprende su cuerpo" },
          { id: "i_psi1c2", name: "Se expresa corporalmente" }
        ]
      }
    ]
  },

  // --- NIVEL PRIMARIA ---
  {
    area: "Comunicación",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_com1",
        name: "Se comunica oralmente en su lengua materna",
        capacities: [
          { id: "p_com1c1", name: "Obtiene información del texto oral" },
          { id: "p_com1c2", name: "Infiere e interpreta información del texto oral" },
          { id: "p_com1c3", name: "Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "p_com1c4", name: "Utiliza recursos no verbales y paraverbales de forma estratégica" },
          { id: "p_com1c5", name: "Interactúa estratégicamente con distintos interlocutores" },
          { id: "p_com1c6", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto oral" }
        ]
      },
      {
        id: "p_com2",
        name: "Lee diversos tipos de textos escritos en su lengua materna",
        capacities: [
          { id: "p_com2c1", name: "Obtiene información del texto escrito" },
          { id: "p_com2c2", name: "Infiere e interpreta información del texto" },
          { id: "p_com2c3", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto" }
        ]
      },
      {
        id: "p_com3",
        name: "Escribe diversos tipos de textos en su lengua materna",
        capacities: [
          { id: "p_com3c1", name: "Adecúa el texto a la situación comunicativa" },
          { id: "p_com3c2", name: "Organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "p_com3c3", name: "Utiliza convenciones del lenguaje escrito de forma pertinente" },
          { id: "p_com3c4", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto escrito" }
        ]
      }
    ]
  },
  {
    area: "Matemática",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_mat1",
        name: "Resuelve problemas de cantidad",
        capacities: [
          { id: "p_mat1c1", name: "Traduce cantidades a expresiones numéricas" },
          { id: "p_mat1c2", name: "Comunica su comprensión sobre los números y las operaciones" },
          { id: "p_mat1c3", name: "Usa estrategias y procedimientos de estimación y cálculo" },
          { id: "p_mat1c4", name: "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones" }
        ]
      },
      {
        id: "p_mat2",
        name: "Resuelve problemas de regularidad, equivalencia y cambio",
        capacities: [
          { id: "p_mat2c1", name: "Traduce datos y condiciones a expresiones algebraicas y gráficas" },
          { id: "p_mat2c2", name: "Comunica su comprensión sobre las relaciones algebraicas" },
          { id: "p_mat2c3", name: "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales" },
          { id: "p_mat2c4", name: "Argumenta afirmaciones sobre relaciones de cambio y equivalencia" }
        ]
      },
      {
        id: "p_mat3",
        name: "Resuelve problemas de forma, movimiento y localización",
        capacities: [
          { id: "p_mat3c1", name: "Modela objetos con formas geométricas y sus transformaciones" },
          { id: "p_mat3c2", name: "Comunica su comprensión sobre las formas y relaciones geométricas" },
          { id: "p_mat3c3", name: "Usa estrategias y procedimientos para orientarse en el espacio" },
          { id: "p_mat3c4", name: "Argumenta afirmaciones sobre relaciones geométricas" }
        ]
      },
      {
        id: "p_mat4",
        name: "Resuelve problemas de gestión de datos e incertidumbre",
        capacities: [
          { id: "p_mat4c1", name: "Representa datos con gráficos y medidas estadísticas o probabilísticas" },
          { id: "p_mat4c2", name: "Comunica su comprensión de los conceptos estadísticos y probabilísticos" },
          { id: "p_mat4c3", name: "Usa estrategias y procedimientos para recopilar y procesar datos" },
          { id: "p_mat4c4", name: "Sustenta conclusiones o decisiones con base en la información obtenida" }
        ]
      }
    ]
  },
  {
    area: "Ciencia y Tecnología",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_ct1",
        name: "Indaga mediante métodos científicos para construir sus conocimientos",
        capacities: [
          { id: "p_ct1c1", name: "Problematiza situaciones para hacer indagación" },
          { id: "p_ct1c2", name: "Diseña estrategias para hacer indagación" },
          { id: "p_ct1c3", name: "Genera y registra datos o información" },
          { id: "p_ct1c4", name: "Analiza datos e información" },
          { id: "p_ct1c5", name: "Evalúa y comunica el proceso y resultados de su indagación" }
        ]
      },
      {
        id: "p_ct2",
        name: "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
        capacities: [
          { id: "p_ct2c1", name: "Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo" },
          { id: "p_ct2c2", name: "Evalúa las implicancias del saber y del quehacer científico y tecnológico" }
        ]
      },
      {
        id: "p_ct3",
        name: "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
        capacities: [
          { id: "p_ct3c1", name: "Determina una alternativa de solución tecnológica" },
          { id: "p_ct3c2", name: "Diseña la alternativa de solución tecnológica" },
          { id: "p_ct3c3", name: "Implementa y valida la alternativa de solución tecnológica" },
          { id: "p_ct3c4", name: "Evalúa y comunica el funcionamiento y los impactos de su alternativa de solución tecnológica" }
        ]
      }
    ]
  },
  {
    area: "Personal Social",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_ps1",
        name: "Construye su identidad",
        capacities: [
          { id: "p_ps1c1", name: "Se valora a sí mismo" },
          { id: "p_ps1c2", name: "Autorregula sus emociones" },
          { id: "p_ps1c3", name: "Reflexiona y argumenta éticamente" },
          { id: "p_ps1c4", name: "Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez" }
        ]
      },
      {
        id: "p_ps2",
        name: "Convive y participa democráticamente en la búsqueda del bien común",
        capacities: [
          { id: "p_ps2c1", name: "Interactúa con todas las personas" },
          { id: "p_ps2c2", name: "Construye normas y asume acuerdos y leyes" },
          { id: "p_ps2c3", name: "Maneja conflictos de manera constructiva" },
          { id: "p_ps2c4", name: "Delibera sobre asuntos públicos" },
          { id: "p_ps2c5", name: "Participa en acciones que promueven el bienestar común" }
        ]
      },
      {
        id: "p_ps3",
        name: "Construye interpretaciones históricas",
        capacities: [
          { id: "p_ps3c1", name: "Interpreta críticamente fuentes diversas" },
          { id: "p_ps3c2", name: "Comprende el tiempo histórico" },
          { id: "p_ps3c3", name: "Elabora explicaciones sobre procesos históricos" }
        ]
      },
      {
        id: "p_ps4",
        name: "Gestiona responsablemente el espacio y el ambiente",
        capacities: [
          { id: "p_ps4c1", name: "Comprende las relaciones entre los elementos naturales y sociales" },
          { id: "p_ps4c2", name: "Maneja fuentes de información para comprender el espacio geográfico y el ambiente" },
          { id: "p_ps4c3", name: "Genera acciones para conservar el ambiente local y global" }
        ]
      },
      {
        id: "p_ps5",
        name: "Gestiona responsablemente los recursos económicos",
        capacities: [
          { id: "p_ps5c1", name: "Comprende las relaciones entre los elementos del sistema económico y financiero" },
          { id: "p_ps5c2", name: "Toma decisiones económicas y financieras" }
        ]
      }
    ]
  },
  {
    area: "Arte y Cultura",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_ac1",
        name: "Aprecia de manera crítica manifestaciones artístico-culturales",
        capacities: [
          { id: "p_ac1c1", name: "Percibe manifestaciones artístico-culturales" },
          { id: "p_ac1c2", name: "Contextualiza manifestaciones artístico-culturales" },
          { id: "p_ac1c3", name: "Reflexiona creativa y críticamente sobre manifestaciones artístico-culturales" }
        ]
      },
      {
        id: "p_ac2",
        name: "Crea proyectos desde los lenguajes artísticos",
        capacities: [
          { id: "p_ac2c1", name: "Explora y experimenta los lenguajes artísticos" },
          { id: "p_ac2c2", name: "Aplica procesos creativos" },
          { id: "p_ac2c3", name: "Evalúa y comunica sus procesos y proyectos" }
        ]
      }
    ]
  },
  {
    area: "Educación Física",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_ef1",
        name: "Se desenvuelve de manera autónoma a través de su motricidad",
        capacities: [
          { id: "p_ef1c1", name: "Comprende su cuerpo" },
          { id: "p_ef1c2", name: "Se expresa corporalmente" }
        ]
      },
      {
        id: "p_ef2",
        name: "Asume una vida saludable",
        capacities: [
          { id: "p_ef2c1", name: "Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud" },
          { id: "p_ef2c2", name: "Incorpora prácticas que mejoran su calidad de vida" }
        ]
      },
      {
        id: "p_ef3",
        name: "Interactúa a través de sus habilidades sociomotrices",
        capacities: [
          { id: "p_ef3c1", name: "Se relaciona utilizando sus habilidades sociomotrices" },
          { id: "p_ef3c2", name: "Crea y aplica estrategias y tácticas de juego" }
        ]
      }
    ]
  },
  {
    area: "Inglés (Lengua Extranjera)",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_ing1",
        name: "Se comunica oralmente en inglés como lengua extranjera",
        capacities: [
          { id: "p_ing1c1", name: "Obtiene información de textos orales" },
          { id: "p_ing1c2", name: "Infiere e interpreta información de textos orales" },
          { id: "p_ing1c3", name: "Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "p_ing1c4", name: "Utiliza recursos no verbales y paraverbales de forma estratégica" },
          { id: "p_ing1c5", name: "Interactúa estratégicamente con distintos interlocutores" },
          { id: "p_ing1c6", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto oral" }
        ]
      },
      {
        id: "p_ing2",
        name: "Lee diversos tipos de textos en inglés como lengua extranjera",
        capacities: [
          { id: "p_ing2c1", name: "Obtiene información del texto escrito" },
          { id: "p_ing2c2", name: "Infiere e interpreta información del texto" },
          { id: "p_ing2c3", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto" }
        ]
      },
      {
        id: "p_ing3",
        name: "Escribe diversos tipos de textos en inglés como lengua extranjera",
        capacities: [
          { id: "p_ing3c1", name: "Adecúa el texto a la situación comunicativa" },
          { id: "p_ing3c2", name: "Organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "p_ing3c3", name: "Utiliza convenciones del lenguaje escrito de forma pertinente" },
          { id: "p_ing3c4", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto escrito" }
        ]
      }
    ]
  },
  {
    area: "Educación Religiosa",
    levels: ["Primaria"],
    competencies: [
      {
        id: "p_er1",
        name: "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas",
        capacities: [
          { id: "p_er1c1", name: "Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente" },
          { id: "p_er1c2", name: "Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa" }
        ]
      },
      {
        id: "p_er2",
        name: "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa",
        capacities: [
          { id: "p_er2c1", name: "Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa" },
          { id: "p_er2c2", name: "Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida" }
        ]
      }
    ]
  },

  // --- NIVEL SECUNDARIA ---
  {
    area: "Comunicación",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_com1",
        name: "Se comunica oralmente en su lengua materna",
        capacities: [
          { id: "s_com1c1", name: "Obtiene información del texto oral" },
          { id: "s_com1c2", name: "Infiere e interpreta información del texto oral" },
          { id: "s_com1c3", name: "Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "s_com1c4", name: "Utiliza recursos no verbales y paraverbales de forma estratégica" },
          { id: "s_com1c5", name: "Interactúa estratégicamente con distintos interlocutores" },
          { id: "s_com1c6", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto oral" }
        ]
      },
      {
        id: "s_com2",
        name: "Lee diversos tipos de textos escritos en su lengua materna",
        capacities: [
          { id: "s_com2c1", name: "Obtiene información del texto escrito" },
          { id: "s_com2c2", name: "Infiere e interpreta información del texto" },
          { id: "s_com2c3", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto" }
        ]
      },
      {
        id: "s_com3",
        name: "Escribe diversos tipos de textos en su lengua materna",
        capacities: [
          { id: "s_com3c1", name: "Adecúa el texto a la situación comunicativa" },
          { id: "s_com3c2", name: "Organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "s_com3c3", name: "Utiliza convenciones del lenguaje escrito de forma pertinente" },
          { id: "s_com3c4", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto escrito" }
        ]
      }
    ]
  },
  {
    area: "Matemática",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_mat1",
        name: "Resuelve problemas de cantidad",
        capacities: [
          { id: "s_mat1c1", name: "Traduce cantidades a expresiones numéricas" },
          { id: "s_mat1c2", name: "Comunica su comprensión sobre los números y las operaciones" },
          { id: "s_mat1c3", name: "Usa estrategias y procedimientos de estimación y cálculo" },
          { id: "s_mat1c4", name: "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones" }
        ]
      },
      {
        id: "s_mat2",
        name: "Resuelve problemas de regularidad, equivalencia y cambio",
        capacities: [
          { id: "s_mat2c1", name: "Traduce datos y condiciones a expresiones algebraicas y gráficas" },
          { id: "s_mat2c2", name: "Comunica su comprensión sobre las relaciones algebraicas" },
          { id: "s_mat2c3", name: "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales" },
          { id: "s_mat2c4", name: "Argumenta afirmaciones sobre relaciones de cambio y equivalencia" }
        ]
      },
      {
        id: "s_mat3",
        name: "Resuelve problemas de forma, movimiento y localización",
        capacities: [
          { id: "s_mat3c1", name: "Modela objetos con formas geométricas y sus transformaciones" },
          { id: "s_mat3c2", name: "Comunica su comprensión sobre las formas y relaciones geométricas" },
          { id: "s_mat3c3", name: "Usa estrategias y procedimientos para orientarse en el espacio" },
          { id: "s_mat3c4", name: "Argumenta afirmaciones sobre relaciones geométricas" }
        ]
      },
      {
        id: "s_mat4",
        name: "Resuelve problemas de gestión de datos e incertidumbre",
        capacities: [
          { id: "s_mat4c1", name: "Representa datos con gráficos y medidas estadísticas o probabilísticas" },
          { id: "s_mat4c2", name: "Comunica su comprensión de los conceptos estadísticos y probabilísticos" },
          { id: "s_mat4c3", name: "Usa estrategias y procedimientos para recopilar y procesar datos" },
          { id: "s_mat4c4", name: "Sustenta conclusiones o decisiones con base en la información obtenida" }
        ]
      }
    ]
  },
  {
    area: "Ciencia y Tecnología",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_ct1",
        name: "Indaga mediante métodos científicos para construir sus conocimientos",
        capacities: [
          { id: "s_ct1c1", name: "Problematiza situaciones para hacer indagación" },
          { id: "s_ct1c2", name: "Diseña estrategias para hacer indagación" },
          { id: "s_ct1c3", name: "Genera y registra datos o información" },
          { id: "s_ct1c4", name: "Analiza datos e información" },
          { id: "s_ct1c5", name: "Evalúa y comunica el proceso y resultados de su indagación" }
        ]
      },
      {
        id: "s_ct2",
        name: "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
        capacities: [
          { id: "s_ct2c1", name: "Comprende y usa conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo" },
          { id: "s_ct2c2", name: "Evalúa las implicancias del saber y del quehacer científico y tecnológico" }
        ]
      },
      {
        id: "s_ct3",
        name: "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
        capacities: [
          { id: "s_ct3c1", name: "Determina una alternativa de solución tecnológica" },
          { id: "s_ct3c2", name: "Diseña la alternativa de solución tecnológica" },
          { id: "s_ct3c3", name: "Implementa y valida la alternativa de solución tecnológica" },
          { id: "s_ct3c4", name: "Evalúa y comunica el funcionamiento y los impactos de su alternativa de solución tecnológica" }
        ]
      }
    ]
  },
  {
    area: "Ciencias Sociales",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_cs1",
        name: "Construye interpretaciones históricas",
        capacities: [
          { id: "s_cs1c1", name: "Interpreta críticamente fuentes diversas" },
          { id: "s_cs1c2", name: "Comprende el tiempo histórico" },
          { id: "s_cs1c3", name: "Elabora explicaciones sobre procesos históricos" }
        ]
      },
      {
        id: "s_cs2",
        name: "Gestiona responsablemente el espacio y el ambiente",
        capacities: [
          { id: "s_cs2c1", name: "Comprende las relaciones entre los elementos naturales y sociales" },
          { id: "s_cs2c2", name: "Maneja fuentes de información para comprender el espacio geográfico y el ambiente" },
          { id: "s_cs2c3", name: "Genera acciones para conservar el ambiente local y global" }
        ]
      },
      {
        id: "s_cs3",
        name: "Gestiona responsablemente los recursos económicos",
        capacities: [
          { id: "s_cs3c1", name: "Comprende las relaciones entre los elementos del sistema económico y financiero" },
          { id: "s_cs3c2", name: "Toma decisiones económicas y financieras" }
        ]
      }
    ]
  },
  {
    area: "Desarrollo Personal, Ciudadanía y Cívica",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_dpcc1",
        name: "Construye su identidad",
        capacities: [
          { id: "s_dpcc1c1", name: "Se valora a sí mismo" },
          { id: "s_dpcc1c2", name: "Autorregula sus emociones" },
          { id: "s_dpcc1c3", name: "Reflexiona y argumenta éticamente" },
          { id: "s_dpcc1c4", name: "Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez" }
        ]
      },
      {
        id: "s_dpcc2",
        name: "Convive y participa democráticamente en la búsqueda del bien común",
        capacities: [
          { id: "s_dpcc2c1", name: "Interactúa con todas las personas" },
          { id: "s_dpcc2c2", name: "Construye normas y asume acuerdos y leyes" },
          { id: "s_dpcc2c3", name: "Maneja conflictos de manera constructiva" },
          { id: "s_dpcc2c4", name: "Delibera sobre asuntos públicos" },
          { id: "s_dpcc2c5", name: "Participa en acciones que promueven el bienestar común" }
        ]
      }
    ]
  },
  {
    area: "Arte y Cultura",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_ac1",
        name: "Aprecia de manera crítica manifestaciones artístico-culturales",
        capacities: [
          { id: "s_ac1c1", name: "Percibe manifestaciones artístico-culturales" },
          { id: "s_ac1c2", name: "Contextualiza manifestaciones artístico-culturales" },
          { id: "s_ac1c3", name: "Reflexiona creativa y críticamente sobre manifestaciones artístico-culturales" }
        ]
      },
      {
        id: "s_ac2",
        name: "Crea proyectos desde los lenguajes artísticos",
        capacities: [
          { id: "s_ac2c1", name: "Explora y experimenta los lenguajes artísticos" },
          { id: "s_ac2c2", name: "Aplica procesos creativos" },
          { id: "s_ac2c3", name: "Evalúa y comunica sus procesos y proyectos" }
        ]
      }
    ]
  },
  {
    area: "Educación Física",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_ef1",
        name: "Se desenvuelve de manera autónoma a través de su motricidad",
        capacities: [
          { id: "s_ef1c1", name: "Comprende su cuerpo" },
          { id: "s_ef1c2", name: "Se expresa corporalmente" }
        ]
      },
      {
        id: "s_ef2",
        name: "Asume una vida saludable",
        capacities: [
          { id: "s_ef2c1", name: "Comprende las relaciones entre la actividad física, alimentación, postura e higiene personal y del ambiente, y la salud" },
          { id: "s_ef2c2", name: "Incorpora prácticas que mejoran su calidad de vida" }
        ]
      },
      {
        id: "s_ef3",
        name: "Interactúa a través de sus habilidades sociomotrices",
        capacities: [
          { id: "s_ef3c1", name: "Se relaciona utilizando sus habilidades sociomotrices" },
          { id: "s_ef3c2", name: "Crea y aplica estrategias y tácticas de juego" }
        ]
      }
    ]
  },
  {
    area: "Inglés (Lengua Extranjera)",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_ing1",
        name: "Se comunica oralmente en inglés como lengua extranjera",
        capacities: [
          { id: "s_ing1c1", name: "Obtiene información de textos orales" },
          { id: "s_ing1c2", name: "Infiere e interpreta información de textos orales" },
          { id: "s_ing1c3", name: "Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "s_ing1c4", name: "Utiliza recursos no verbales y paraverbales de forma estratégica" },
          { id: "s_ing1c5", name: "Interactúa estratégicamente con distintos interlocutores" },
          { id: "s_ing1c6", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto oral" }
        ]
      },
      {
        id: "s_ing2",
        name: "Lee diversos tipos de textos en inglés como lengua extranjera",
        capacities: [
          { id: "s_ing2c1", name: "Obtiene información del texto escrito" },
          { id: "s_ing2c2", name: "Infiere e interpreta información del texto" },
          { id: "s_ing2c3", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto" }
        ]
      },
      {
        id: "s_ing3",
        name: "Escribe diversos tipos de textos en inglés como lengua extranjera",
        capacities: [
          { id: "s_ing3c1", name: "Adecúa el texto a la situación comunicativa" },
          { id: "s_ing3c2", name: "Organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { id: "s_ing3c3", name: "Utiliza convenciones del lenguaje escrito de forma pertinente" },
          { id: "s_ing3c4", name: "Reflexiona y evalúa la forma, el contenido y el contexto del texto escrito" }
        ]
      }
    ]
  },
  {
    area: "Educación Religiosa",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_er1",
        name: "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas",
        capacities: [
          { id: "s_er1c1", name: "Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente" },
          { id: "s_er1c2", name: "Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa" }
        ]
      },
      {
        id: "s_er2",
        name: "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa",
        capacities: [
          { id: "s_er2c1", name: "Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa" },
          { id: "s_er2c2", name: "Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida" }
        ]
      }
    ]
  },
  {
    area: "Educación para el Trabajo",
    levels: ["Secundaria"],
    competencies: [
      {
        id: "s_ept1",
        name: "Gestiona proyectos de emprendimiento económico o social",
        capacities: [
          { id: "s_ept1c1", name: "Crea propuestas de valor" },
          { id: "s_ept1c2", name: "Trabaja cooperativamente para lograr objetivos y metas" },
          { id: "s_ept1c3", name: "Aplica habilidades técnicas" },
          { id: "s_ept1c4", name: "Evalúa los resultados del proyecto de emprendimiento" }
        ]
      }
    ]
  },
  {
    area: "Tutoría",
    levels: ["Primaria", "Secundaria"],
    competencies: [
      {
        id: "tut1",
        name: "Construye su identidad",
        capacities: [
          { id: "tut1c1", name: "Se valora a sí mismo" },
          { id: "tut1c2", name: "Autorregula sus emociones" },
          { id: "tut1c3", name: "Reflexiona y argumenta éticamente" },
          { id: "tut1c4", name: "Vive su sexualidad de manera integral y responsable" }
        ]
      },
      {
        id: "tut2",
        name: "Convive y participa democráticamente en la búsqueda del bien común",
        capacities: [
          { id: "tut2c1", name: "Interactúa con todas las personas" },
          { id: "tut2c2", name: "Construye normas y asume acuerdos y leyes" },
          { id: "tut2c3", name: "Maneja conflictos de manera constructiva" },
          { id: "tut2c4", name: "Delibera sobre asuntos públicos" },
          { id: "tut2c5", name: "Participa en acciones que promueven el bienestar común" }
        ]
      },
      {
        id: "tut3",
        name: "Gestiona su aprendizaje de manera autónoma",
        capacities: [
          { id: "tut3c1", name: "Define metas de aprendizaje" },
          { id: "tut3c2", name: "Organiza acciones estratégicas para alcanzar sus metas" },
          { id: "tut3c3", name: "Monitorea y ajusta su desempeño durante el proceso" }
        ]
      },
      {
        id: "tut4",
        name: "Se desenvuelve de manera autónoma a través de su motricidad",
        capacities: [
          { id: "tut4c1", name: "Comprende su cuerpo" },
          { id: "tut4c2", name: "Se expresa corporalmente" }
        ]
      },
      {
        id: "tut5",
        name: "Asume una vida saludable",
        capacities: [
          { id: "tut5c1", name: "Comprende las relaciones entre la actividad física, alimentación, postura e higiene" },
          { id: "tut5c2", name: "Incorpora prácticas que mejoran su calidad de vida" }
        ]
      },
      {
        id: "tut6",
        name: "Interactúa a través de sus habilidades sociomotrices",
        capacities: [
          { id: "tut6c1", name: "Se relaciona utilizando sus habilidades sociomotrices" },
          { id: "tut6c2", name: "Crea y aplica estrategias y tácticas de juego" }
        ]
      }
    ]
  }
];

