import { useState } from "react";

const aiTools = [
  { name: "ChatGPT", url: "https://chat.openai.com", description: "Asistente versátil para planificación, redacción y resolución de dudas.", category: "Chat", color: "#10b981", emoji: "💬" },
  { name: "Gemini", url: "https://gemini.google.com", description: "IA de Google integrada con su ecosistema, ideal para investigación.", category: "Chat", color: "#3b82f6", emoji: "✨" },
  { name: "DeepSeek", url: "https://chat.deepseek.com", description: "IA avanzada con capacidades de razonamiento y codificación.", category: "Chat", color: "#4f46e5", emoji: "🧠" },
  { name: "Claude", url: "https://claude.ai", description: "IA con gran capacidad de análisis de textos largos y redacción natural.", category: "Chat", color: "#d97706", emoji: "💬" },
  { name: "Perplexity", url: "https://www.perplexity.ai", description: "Buscador con IA que cita fuentes en tiempo real, ideal para investigación académica.", category: "Investigación", color: "#06b6d4", emoji: "🔍" },
  { name: "Gamma", url: "https://gamma.app", description: "Generación automática de presentaciones, documentos y páginas web.", category: "Contenido", color: "#a855f7", emoji: "🖼️" },
  { name: "Canva Magic Studio", url: "https://www.canva.com", description: "Herramientas de IA integradas para diseño gráfico y presentaciones.", category: "Contenido", color: "#7c3aed", emoji: "🎨" },
  { name: "ImageFX Whisk", url: "https://labs.google/fx/es/tools/whisk", description: "Herramienta experimental de Google para combinar imágenes con IA.", category: "Contenido", color: "#2563eb", emoji: "🖼️" },
  { name: "TextFX Flow", url: "https://labs.google/fx/es/tools/flow", description: "Herramienta de Google para expandir ideas y generar flujos de escritura.", category: "Contenido", color: "#6366f1", emoji: "📝" },
  { name: "Tripo3D", url: "https://www.tripo3d.ai", description: "Generación de modelos 3D a partir de texto o imágenes.", category: "Contenido", color: "#334155", emoji: "🎬" },
  { name: "NotebookLM", url: "https://notebooklm.google.com", description: "Cuaderno de notas inteligente basado en tus propios documentos.", category: "Educación", color: "#f97316", emoji: "📖" },
  { name: "Educaplay", url: "https://www.educaplay.com", description: "Plataforma para crear actividades educativas multimedia.", category: "Educación", color: "#eab308", emoji: "✨" },
  { name: "Curipod", url: "https://curipod.com", description: "IA para crear lecciones interactivas que fomentan la participación.", category: "Educación", color: "#818cf8", emoji: "✨" },
  { name: "Educima", url: "https://www.educima.com", description: "Generador de crucigramas, sopas de letras y dibujos para colorear.", category: "Educación", color: "#ef4444", emoji: "📖" },
  { name: "Toy Theater", url: "https://toytheater.com", description: "Colección de juegos educativos interactivos para primaria.", category: "Educación", color: "#60a5fa", emoji: "✨" },
  { name: "Kahoot!", url: "https://kahoot.com/es/", description: "Plataforma basada en juegos para crear cuestionarios interactivos.", category: "Educación", color: "#9333ea", emoji: "✨" },
  { name: "Suno", url: "https://suno.com", description: "IA para generación de música y canciones personalizadas.", category: "Audio/Video", color: "#ec4899", emoji: "🎵" },
  { name: "TextToVoice", url: "https://texttovoice.org/es/", description: "Conversor de texto a voz con voces naturales en múltiples idiomas.", category: "Audio/Video", color: "#f43f5e", emoji: "🎵" },
  { name: "YouTube Downloader", url: "https://addoncrop.com/v10/youtube-downloader/", description: "Herramienta para descargar videos de YouTube rápidamente.", category: "Audio/Video", color: "#dc2626", emoji: "🎬" },
  { name: "YTMP3 Converter", url: "https://media.ytmp3.gg/pe/", description: "Convertidor rápido de videos de YouTube a formato MP3.", category: "Audio/Video", color: "#ea580c", emoji: "🎵" },
];

const categories = ["Todas", "Chat", "Investigación", "Contenido", "Educación", "Audio/Video"];

const categoryColors = {
  "Chat": "#3b82f6",
  "Investigación": "#06b6d4",
  "Contenido": "#a855f7",
  "Educación": "#f97316",
  "Audio/Video": "#ec4899",
};

export default function AIPages() {
  const [active, setActive] = useState("Todas");
  const [hovered, setHovered] = useState(null);

  const filtered = active === "Todas" ? aiTools : aiTools.filter(t => t.category === active);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card { animation: fadeUp 0.4s ease both; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; }
        .pill:hover { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ borderBottom: "3px solid #e2e8f0", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
            🤖 PÁGINAS DE IA
          </h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1.05rem" }}>
            Accede a las mejores herramientas de inteligencia artificial para potenciar tu labor docente.
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {categories.map(cat => (
            <button
              key={cat}
              className="pill"
              onClick={() => setActive(cat)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                transition: "all 0.2s",
                background: active === cat ? (categoryColors[cat] || "#0f172a") : "#e2e8f0",
                color: active === cat ? "#fff" : "#475569",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {filtered.map((tool, i) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              onMouseEnter={() => setHovered(tool.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                animationDelay: `${i * 0.04}s`,
                display: "block",
                background: "#fff",
                border: hovered === tool.name ? `1.5px solid ${tool.color}` : "1.5px solid #e2e8f0",
                borderRadius: 16,
                padding: "1.4rem",
                textDecoration: "none",
                transition: "all 0.25s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Top accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: tool.color,
                transform: hovered === tool.name ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s ease",
                borderRadius: "16px 16px 0 0",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.9rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: tool.color + "20",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.3rem",
                }}>
                  {tool.emoji}
                </div>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: tool.color,
                  background: tool.color + "15",
                  padding: "0.25rem 0.6rem", borderRadius: 6,
                }}>
                  {tool.category}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{tool.name}</h3>
                <span style={{ color: hovered === tool.name ? tool.color : "#cbd5e1", fontSize: "0.85rem", transition: "color 0.2s" }}>↗</span>
              </div>

              <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.55, margin: 0 }}>
                {tool.description}
              </p>

              <div style={{
                marginTop: "1rem", fontSize: "0.72rem", fontWeight: 800,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: tool.color,
                opacity: hovered === tool.name ? 1 : 0,
                transition: "opacity 0.2s",
              }}>
                Abrir herramienta →
              </div>
            </a>
          ))}
        </div>

        {/* Footer banner */}
        <div style={{
          marginTop: "2.5rem", background: "#0f172a", borderRadius: 20,
          padding: "2rem 2.5rem", color: "#fff", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 0.4rem" }}>¿Necesitas otra herramienta?</h3>
            <p style={{ color: "#94a3b8", margin: 0, maxWidth: 500 }}>
              Esta lista se actualiza constantemente con las mejores IAs para educación. Si conoces alguna que falte, contáctanos para agregarla.
            </p>
          </div>
          <div style={{
            position: "absolute", right: -40, bottom: -40,
            width: 200, height: 200,
            background: "#dc2626", opacity: 0.12,
            borderRadius: "50%", filter: "blur(40px)",
          }} />
        </div>
      </div>
    </div>
  );
}
