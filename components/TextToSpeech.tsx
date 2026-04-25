import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Volume2, Play, Download, Loader2, AlertCircle } from 'lucide-react';

const VOICES = [
  { id: 'Puck', name: 'Puck (Juvenil)' },
  { id: 'Charon', name: 'Charon (Profundo)' },
  { id: 'Kore', name: 'Kore (Suave)' },
  { id: 'Fenrir', name: 'Fenrir (Fuerte)' },
  { id: 'Zephyr', name: 'Zephyr (Aireado)' },
];

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createWavHeader = (pcmData: Uint8Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + pcmData.length, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, 1, true); // Mono
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, pcmData.length, true);

    // write the PCM data
    const uint8Buffer = new Uint8Array(buffer);
    uint8Buffer.set(pcmData, 44);

    return uint8Buffer;
  };

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a natural tone: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Audio);
        const pcmData = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pcmData[i] = binaryString.charCodeAt(i);
        }
        
        // Add WAV header (Gemini TTS returns raw PCM 16-bit 24kHz)
        const wavData = createWavHeader(pcmData, 24000);
        const audioBlob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      } else {
        throw new Error('No se pudo generar el audio. Intenta con un texto más corto o diferente.');
      }
    } catch (err: any) {
      console.error('Error generating speech:', err);
      setError(err.message || 'Ocurrió un error al generar el audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `audio-generado-${Date.now()}.wav`;
      a.click();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <section className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-10 py-8">
          <h2 className="text-[12px] font-black text-amber-500 uppercase tracking-widest mb-2">Herramientas de IA</h2>
          <h3 className="text-2xl font-black uppercase">Texto a Voz (TTS)</h3>
          <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Convierte tus textos en audios naturales con inteligencia artificial</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Texto a convertir</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe o pega el texto que deseas convertir a audio..."
              className="w-full h-48 bg-slate-50 border border-slate-200 p-6 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all resize-none"
            />
            <div className="flex justify-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {text.length} caracteres
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seleccionar Voz</label>
              <div className="grid grid-cols-1 gap-2">
                {VOICES.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all ${
                      selectedVoice === voice.id
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-lg shadow-amber-500/5'
                        : 'border-slate-100 hover:border-amber-200 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{voice.name}</span>
                    {selectedVoice === voice.id && <Volume2 size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${
                  isGenerating || !text.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generando Audio...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Generar Audio
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-600 animate-shake">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              )}

              {audioUrl && (
                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Audio Generado con Éxito</span>
                    <button
                      onClick={handleDownload}
                      className="p-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Descargar Audio"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                  <audio controls src={audioUrl} className="w-full h-10" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2rem]">
        <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertCircle size={16} />
          Consejos para mejores resultados
        </h4>
        <ul className="space-y-2">
          <li className="text-[11px] font-bold text-amber-700 flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            Usa puntuación adecuada para que la IA sepa dónde hacer pausas.
          </li>
          <li className="text-[11px] font-bold text-amber-700 flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            Evita textos extremadamente largos en una sola generación.
          </li>
          <li className="text-[11px] font-bold text-amber-700 flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
            Prueba diferentes voces para encontrar la que mejor se adapte a tu contenido.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TextToSpeech;
