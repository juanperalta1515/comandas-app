import React, { useState } from 'react';
import { 
  Briefcase, 
  KanbanSquare, 
  FileText, 
  Globe, 
  User, 
  Zap, 
  MapPin, 
  Award,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import CoverLetter from './components/CoverLetter';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Información estática del perfil del usuario (arquitectura del CV / perfil)
  const profileInfo = {
    name: "Desarrollador Full Stack Senior",
    techStack: ".NET, C#, SQL Server, React, Angular",
    experience: "+3 Años de Experiencia Profesional",
    visaGoal: "Relocation & Visa Sponsorship en la UE",
    preferredDestinations: ["España", "Alemania", "Países Bajos"],
    educationNote: "Visado Basado en Experiencia (Sin Título Universitario)"
  };

  const navItems = [
    { id: 'dashboard', label: 'Búsquedas Diarias', icon: Briefcase },
    { id: 'tracker', label: 'Seguimiento (Job Tracker)', icon: KanbanSquare },
    { id: 'coverletter', label: 'Generador de Cover Letter', icon: FileText }
  ];

  return (
    <div class="min-h-screen bg-dark-950 flex flex-col md:flex-row relative">
      
      {/* Glow backgrounds de fondo para estética premium */}
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>
      <div class="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>

      {/* Mobile Top Navigation */}
      <div class="md:hidden flex items-center justify-between p-4 bg-dark-900 border-b border-dark-800 z-50">
        <div class="flex items-center gap-2">
          <Zap class="text-blue-500 w-6 h-6" />
          <span class="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">JOB HUNTER EU</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          class="text-slate-400 hover:text-white p-1"
        >
          {isMobileMenuOpen ? <X class="w-6 h-6" /> : <Menu class="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside class={`
        fixed inset-y-0 left-0 z-40 w-64 bg-dark-900/90 md:bg-dark-900 border-r border-dark-800 p-6 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div class="hidden md:flex items-center gap-2.5 mb-8">
            <div class="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Zap class="text-white w-5 h-5" />
            </div>
            <span class="font-display font-extrabold text-xl tracking-wider bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              JOB HUNTER EU
            </span>
          </div>

          {/* User Target Card */}
          <div class="bg-dark-950/60 border border-dark-800 rounded-2xl p-4 mb-6 relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-600/10 rounded-full blur-xl"></div>
            <div class="flex items-center gap-2 text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">
              <User class="w-3.5 h-3.5" />
              <span>Perfil Candidato</span>
            </div>
            <h3 class="font-display font-bold text-sm text-slate-100 mb-1 leading-tight">{profileInfo.name}</h3>
            <p class="text-xs text-slate-400 mb-3">{profileInfo.techStack}</p>
            
            <div class="flex flex-col gap-1.5 pt-3 border-t border-dark-800/80 text-[11px] text-slate-300">
              <div class="flex items-center gap-1.5">
                <MapPin class="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Meta: {profileInfo.preferredDestinations.join(', ')}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Award class="w-3 h-3 text-blue-400 shrink-0" />
                <span>{profileInfo.experience}</span>
              </div>
              <div class="flex items-center gap-1.5 text-blue-300 font-medium">
                <Globe class="w-3 h-3 shrink-0" />
                <span>Sponsorship Target</span>
              </div>
            </div>
          </div>

          {/* Menú Items */}
          <nav class="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  class={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800/60'
                    }
                  `}
                >
                  <div class="flex items-center gap-3">
                    <Icon class={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight class={`w-4 h-4 transition-transform ${isActive ? 'translate-x-0.5 opacity-100' : 'opacity-0'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div class="pt-4 border-t border-dark-800 text-center">
          <div class="text-[10px] text-slate-500 font-mono">
            V1.0.0 | Netlify Ready
          </div>
          <div class="text-[10px] text-blue-400/80 hover:text-blue-400 mt-1 cursor-help transition-colors">
            {profileInfo.educationNote}
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main class="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto max-h-screen">
        
        {/* Renderizado condicional de componentes */}
        <div class="flex-1 flex flex-col">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tracker' && <Tracker />}
          {activeTab === 'coverletter' && <CoverLetter />}
        </div>
      </main>
    </div>
  );
}

export default App;
