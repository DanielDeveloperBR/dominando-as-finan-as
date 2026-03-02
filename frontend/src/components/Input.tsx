import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
}

export const Input: React.FC<InputProps> = ({ label, erro, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <input
        className={`bg-slate-950 border ${erro ? 'border-rose-500' : 'border-slate-800'} text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 placeholder-slate-500 transition-colors ${className}`}
        {...props}
      />
      {erro && <span className="text-xs text-rose-500">{erro}</span>}
    </div>
  );
};