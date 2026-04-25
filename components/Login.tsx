
import React, { useState } from 'react';

interface Props {
  onLoginSuccess: () => void;
}

const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Use sessionStorage so it asks again when opening the link in a new session
        sessionStorage.setItem('is_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError(result.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err: any) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <h2 className="text-white text-xl font-black uppercase tracking-tighter">Acceso Institucional</h2>
          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">Plataforma de Planificación Curricular</p>
          <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mt-2">DISEÑADO POR Jhair Mondragon Bustamante</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl text-center font-bold">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Usuario Maestro</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              placeholder="Admin"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
          
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-tight">
              Uso exclusivo para personal docente autorizado.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
