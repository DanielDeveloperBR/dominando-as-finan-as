import React from 'react';

interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'fantasma';
  carregando?: boolean;
}

export const Botao: React.FC<BotaoProps> = ({ 
  children, 
  variante = 'primario', 
  carregando = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantes = {
    primario: "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500 shadow-lg shadow-emerald-500/20",
    secundario: "bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-500 border border-slate-700",
    perigo: "bg-rose-500 hover:bg-rose-600 text-white focus:ring-rose-500 shadow-lg shadow-rose-500/20",
    fantasma: "bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variantes[variante]} ${className}`}
      disabled={disabled || carregando}
      {...props}
    >
      {carregando ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processando...
        </>
      ) : children}
    </button>
  );
};