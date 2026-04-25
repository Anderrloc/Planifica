import React, { useState, useRef } from 'react';
import { useLogo } from './LogoContext';
import { Building2, Upload, Trash2, CheckCircle, Info, Lock, User, Key } from 'lucide-react';
import { motion } from 'motion/react';

const InstitutionSettings: React.FC = () => {
  const { logo, setLogo, institutionName, setInstitutionName } = useLogo();
  const [isSaved, setIsSaved] = useState(false);
  const [credentials, setCredentials] = useState({
    currentUsername: '',
    currentPassword: '',
    newUsername: '',
    newPassword: ''
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isUpdatingAuth, setIsUpdatingAuth] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsUpdatingAuth(true);

    try {
      const response = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAuthSuccess('Credenciales actualizadas correctamente. Deberás iniciar sesión nuevamente con los nuevos datos.');
        setCredentials({
          currentUsername: '',
          currentPassword: '',
          newUsername: '',
          newPassword: ''
        });
        // Optional: Logout after change
        setTimeout(() => {
          sessionStorage.removeItem('is_authenticated');
          window.location.reload();
        }, 3000);
      } else {
        setAuthError(result.message || 'Error al actualizar credenciales');
      }
    } catch (err) {
      setAuthError('Error de conexión con el servidor');
    } finally {
      setIsUpdatingAuth(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo es demasiado grande. El tamaño máximo es 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          Configuración de la Institución
        </h1>
        <p className="text-slate-500 mt-2">
          Personaliza los documentos generados con el nombre y logotipo de tu institución educativa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Institution Name */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre de la Institución
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Ej. I.E. Emblemática San Juan"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Este nombre aparecerá en el encabezado de todos los documentos generados.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700 mb-4">
              Logotipo Institucional
            </label>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-colors hover:border-indigo-300">
              {logo ? (
                <div className="relative group">
                  <img 
                    src={logo} 
                    alt="Logo Institucional" 
                    className="max-h-48 rounded-lg shadow-md mb-4"
                  />
                  <button
                    onClick={() => setLogo(null)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Haz clic para subir o arrastra una imagen</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG o SVG (Máx. 2MB)</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              
              {!logo && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Seleccionar Imagen
                </button>
              )}
            </div>
            
            <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
              <Info className="w-3 h-3" />
              El logotipo se incluirá automáticamente en la esquina superior de tus planificaciones.
            </p>
          </div>

          {/* Master Credentials Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-slate-900">Seguridad y Acceso</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Cambia el usuario y la contraseña maestra para el acceso a la plataforma. 
              Este cambio afectará a todos los usuarios que utilicen el enlace compartido.
            </p>

            <form onSubmit={handleUpdateAuth} className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-bold text-center">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-xl font-bold text-center">
                  {authSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Usuario Actual</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={credentials.currentUsername}
                      onChange={(e) => setCredentials({...credentials, currentUsername: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                      placeholder="Usuario actual"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contraseña Actual</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={credentials.currentPassword}
                      onChange={(e) => setCredentials({...credentials, currentPassword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nuevo Usuario</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                      type="text"
                      value={credentials.newUsername}
                      onChange={(e) => setCredentials({...credentials, newUsername: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                      placeholder="Nuevo usuario"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nueva Contraseña</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                      type="password"
                      value={credentials.newPassword}
                      onChange={(e) => setCredentials({...credentials, newPassword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                      placeholder="Nueva contraseña"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingAuth}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isUpdatingAuth ? 'Actualizando...' : 'Actualizar Credenciales de Acceso'}
              </button>
            </form>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  ¡Configuración Guardada!
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Vista Previa
            </h3>
            <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm min-h-[200px] flex flex-col items-center justify-center text-center">
              {logo ? (
                <img src={logo} alt="Preview" className="max-h-24 mb-3" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-tight">
                {institutionName || 'NOMBRE DE TU INSTITUCIÓN'}
              </h4>
              <div className="w-full h-px bg-slate-100 my-3"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Planificación Curricular 2026
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-3">¿Por qué configurar esto?</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                Personalización profesional de todos los documentos.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                Ahorro de tiempo al no tener que insertar el logo manualmente.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                Identidad institucional clara en tus materiales educativos.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionSettings;
