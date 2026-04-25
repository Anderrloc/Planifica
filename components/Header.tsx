
import React from 'react';
import { DeviceType } from '../types';
import { Smartphone, Tablet, Monitor, Key, Menu, X } from 'lucide-react';
import { useLogo } from './LogoContext';

interface Props {
  onLogout: () => void;
  device: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  hasKey: boolean;
  onSelectKey: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<Props> = ({ 
  onLogout, 
  device, 
  onDeviceChange, 
  hasKey, 
  onSelectKey,
  isSidebarOpen,
  onToggleSidebar
}) => {
  const { institutionName } = useLogo();
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          title={isSidebarOpen ? "Ocultar Menú" : "Mostrar Menú"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div>
          <h1 className="text-sm font-semibold text-gray-800 leading-tight">
            {institutionName || 'Planificador Curricular Institucional'}
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Gestión Académica Institucional</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Celular"
          >
            <Smartphone size={18} />
          </button>
          <button
            onClick={() => onDeviceChange('tablet')}
            className={`p-1.5 rounded-md transition-all ${device === 'tablet' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Tablet"
          >
            <Tablet size={18} />
          </button>
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Computadora"
          >
            <Monitor size={18} />
          </button>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSelectKey}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
              hasKey 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
            }`}
            title={hasKey ? "API Key Seleccionada" : "Seleccionar API Key"}
          >
            <Key size={14} />
            <span className="hidden sm:inline">{hasKey ? 'API Activa' : 'Configurar API'}</span>
          </button>

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-700">Bienvenido, Docente</span>
            <span className="text-[10px] text-gray-500">Sesión activa: 16081</span>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
