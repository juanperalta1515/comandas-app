import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Send, 
  Hourglass, 
  Ban, 
  Trash2, 
  Calendar, 
  FileText, 
  Save, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin
} from 'lucide-react';

function Tracker() {
  const [trackedJobs, setTrackedJobs] = useState([]);
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [editingDate, setEditingDate] = useState('');

  // Cargar candidaturas desde localStorage
  const loadTrackedJobs = () => {
    const jobs = JSON.parse(localStorage.getItem('tracked_jobs') || '[]');
    // Ordenar de más recientes a más antiguas
    jobs.sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
    setTrackedJobs(jobs);
  };

  useEffect(() => {
    loadTrackedJobs();
  }, []);

  // Actualizar localStorage y estado
  const updateTrackedJobs = (updatedJobs) => {
    localStorage.setItem('tracked_jobs', JSON.stringify(updatedJobs));
    setTrackedJobs(updatedJobs);
  };

  // Cambiar el estado de una candidatura
  const handleStatusChange = (jobId, newStatus) => {
    const updated = trackedJobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: newStatus,
          // Si pasa a "Aplicado" y no tiene fecha de postulación, autocompletar con hoy
          appliedDate: newStatus === 'Aplicado' && !job.appliedDate 
            ? new Date().toISOString().split('T')[0] 
            : job.appliedDate
        };
      }
      return job;
    });
    updateTrackedJobs(updated);
  };

  // Eliminar candidatura
  const handleDeleteJob = (jobId) => {
    if (window.confirm('¿Seguro que deseas eliminar esta oferta del tracker?')) {
      const updated = trackedJobs.filter(job => job.id !== jobId);
      updateTrackedJobs(updated);
      if (editingJobId === jobId) {
        setEditingJobId(null);
      }
    }
  };

  // Iniciar edición de notas / detalles
  const startEditing = (job) => {
    setEditingJobId(job.id);
    setEditingNotes(job.notes || '');
    setEditingDate(job.appliedDate || '');
  };

  // Guardar notas / detalles editados
  const saveDetails = (jobId) => {
    const updated = trackedJobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          notes: editingNotes,
          appliedDate: editingDate
        };
      }
      return job;
    });
    updateTrackedJobs(updated);
    setEditingJobId(null);
  };

  // Estadísticas rápidas
  const stats = {
    total: trackedJobs.length,
    pending: trackedJobs.filter(j => j.status === 'Pendiente').length,
    applied: trackedJobs.filter(j => j.status === 'Aplicado').length,
    inProcess: trackedJobs.filter(j => j.status === 'En Proceso').length,
    rejected: trackedJobs.filter(j => j.status === 'Descartado').length
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pendiente':
        return { color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: ClipboardList, label: 'Pendiente' };
      case 'Aplicado':
        return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Send, label: 'Aplicado' };
      case 'En Proceso':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Hourglass, label: 'En Proceso' };
      case 'Descartado':
        return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: Ban, label: 'Descartado' };
      default:
        return { color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: ClipboardList, label: 'Pendiente' };
    }
  };

  return (
    <div class="flex-1 flex flex-col space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 class="font-display font-extrabold text-2xl md:text-3xl text-slate-100 flex items-center gap-2">
          Seguimiento de Candidaturas (Job Tracker)
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Administra el progreso de tus postulaciones, guarda anotaciones de entrevistas y fechas clave.
        </p>
      </div>

      {/* Stats Cards */}
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        
        <div class="glass-panel rounded-2xl p-4 flex flex-col justify-between">
          <span class="text-xs font-semibold text-slate-400">Total Seguidos</span>
          <span class="font-display font-black text-2xl md:text-3xl text-slate-100 mt-1">{stats.total}</span>
        </div>

        <div class="glass-panel rounded-2xl p-4 flex flex-col justify-between border-l-2 border-l-slate-500">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-semibold">Pendientes</span>
            <ClipboardList class="w-4 h-4 shrink-0" />
          </div>
          <span class="font-display font-black text-2xl md:text-3xl text-slate-200 mt-1">{stats.pending}</span>
        </div>

        <div class="glass-panel rounded-2xl p-4 flex flex-col justify-between border-l-2 border-l-blue-500">
          <div class="flex items-center justify-between text-blue-400">
            <span class="text-xs font-semibold">Aplicados</span>
            <Send class="w-4 h-4 shrink-0" />
          </div>
          <span class="font-display font-black text-2xl md:text-3xl text-blue-400 mt-1">{stats.applied}</span>
        </div>

        <div class="glass-panel rounded-2xl p-4 flex flex-col justify-between border-l-2 border-l-amber-500">
          <div class="flex items-center justify-between text-amber-400">
            <span class="text-xs font-semibold">En Proceso</span>
            <Hourglass class="w-4 h-4 shrink-0" />
          </div>
          <span class="font-display font-black text-2xl md:text-3xl text-amber-400 mt-1">{stats.inProcess}</span>
        </div>

        <div class="glass-panel rounded-2xl p-4 flex flex-col justify-between border-l-2 border-l-rose-500 col-span-2 md:col-span-1">
          <div class="flex items-center justify-between text-rose-400">
            <span class="text-xs font-semibold">Descartados</span>
            <Ban class="w-4 h-4 shrink-0" />
          </div>
          <span class="font-display font-black text-2xl md:text-3xl text-rose-400 mt-1">{stats.rejected}</span>
        </div>

      </div>

      {/* Listado de Candidaturas */}
      {trackedJobs.length === 0 ? (
        <div class="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div class="bg-blue-600/10 p-4 rounded-full border border-blue-500/10">
            <Sparkles class="w-8 h-8 text-blue-400" />
          </div>
          <h3 class="font-display font-bold text-lg text-slate-300">Tu tracker está vacío</h3>
          <p class="text-sm text-slate-500 max-w-sm">
            Ve a la pestaña de "Búsquedas Diarias" y guarda ofertas utilizando el botón del marcador 🔖 para empezar a gestionarlas aquí.
          </p>
        </div>
      ) : (
        <div class="space-y-4">
          {trackedJobs.map((job) => {
            const statusConfig = getStatusConfig(job.status);
            const StatusIcon = statusConfig.icon;
            const isEditing = editingJobId === job.id;

            return (
              <div 
                key={job.id} 
                class="glass-panel rounded-2xl p-5 md:p-6 flex flex-col space-y-4"
              >
                {/* Header de la oferta */}
                <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-semibold text-blue-400">{job.company}</span>
                      <span class="text-slate-600">•</span>
                      <span class="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin class="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    </div>
                    <h2 class="font-display font-bold text-lg text-slate-100">{job.title}</h2>
                  </div>

                  {/* Selector de Estado y Botón de Borrar */}
                  <div class="flex items-center gap-2 self-start md:self-auto">
                    
                    {/* Badge / Selector de Estado */}
                    <div class={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${statusConfig.color}`}>
                      <StatusIcon class="w-3.5 h-3.5 shrink-0" />
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        class="bg-transparent font-semibold focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="Pendiente" class="bg-dark-900 text-slate-300">Pendiente</option>
                        <option value="Aplicado" class="bg-dark-900 text-blue-400">Aplicado</option>
                        <option value="En Proceso" class="bg-dark-900 text-amber-400">En Proceso</option>
                        <option value="Descartado" class="bg-dark-900 text-rose-400">Descartado</option>
                      </select>
                    </div>

                    <a 
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 bg-dark-950/60 border border-dark-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors"
                      title="Ver oferta original"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      class="p-2 bg-dark-950/60 border border-dark-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                      title="Eliminar candidatura"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Formulario de Edición / Notas */}
                {isEditing ? (
                  <div class="bg-dark-950/60 border border-dark-800 rounded-2xl p-4 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Fecha de Postulación */}
                      <div class="space-y-1.5">
                        <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <Calendar class="w-3.5 h-3.5 text-blue-400" />
                          Fecha de Postulación
                        </label>
                        <input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          class="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>

                    </div>

                    {/* Notas */}
                    <div class="space-y-1.5">
                      <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <FileText class="w-3.5 h-3.5 text-emerald-400" />
                        Notas y Bitácora de Entrevistas
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Registra contactos, salarios conversados, preguntas de la prueba técnica o próximos pasos..."
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        class="w-full bg-dark-950 border border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div class="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingJobId(null)}
                        class="px-3.5 py-1.5 border border-dark-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveDetails(job.id)}
                        class="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition-colors"
                      >
                        <Save class="w-3.5 h-3.5" />
                        Guardar Detalles
                      </button>
                    </div>

                  </div>
                ) : (
                  // Vista de detalles colapsada (Muestra fecha y notas si existen)
                  <div class="bg-dark-950/30 border border-dark-800/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex-1 space-y-2">
                      <div class="flex flex-wrap items-center gap-4 text-xs">
                        
                        {/* Fecha de Postulación badge */}
                        <div class="flex items-center gap-1.5 text-slate-400">
                          <Calendar class="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {job.appliedDate 
                              ? `Postulado el: ${new Date(job.appliedDate).toLocaleDateString()}` 
                              : 'Sin fecha de postulación'
                            }
                          </span>
                        </div>

                      </div>

                      {/* Nota previsualización */}
                      {job.notes ? (
                        <div class="flex items-start gap-2 bg-dark-950/60 border border-dark-800/40 rounded-xl p-3 text-xs text-slate-300">
                          <MessageSquare class="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <p class="whitespace-pre-line leading-relaxed">{job.notes}</p>
                        </div>
                      ) : (
                        <p class="text-xs text-slate-500 italic">No has agregado notas todavía para esta postulación.</p>
                      )}
                    </div>

                    <button
                      onClick={() => startEditing(job)}
                      class="flex items-center gap-1.5 px-3.5 py-2 bg-dark-900 hover:bg-dark-800 border border-dark-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all self-start md:self-auto"
                    >
                      <FileText class="w-3.5 h-3.5 text-blue-400" />
                      Editar Notas
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default Tracker;
