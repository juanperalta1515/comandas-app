import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Languages, 
  ChevronRight, 
  Sparkles,
  Info,
  Briefcase,
  Building,
  MapPin,
  MessageSquare
} from 'lucide-react';

function CoverLetter() {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer (.NET & React)');
  const [company, setCompany] = useState('Booking.com');
  const [location, setLocation] = useState('Amsterdam, Netherlands');
  const [language, setLanguage] = useState('en'); // 'en' o 'es'
  const [templateType, setTemplateType] = useState('formal'); // 'formal' o 'cold-outreach'
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);

  // Lógica de generación dinámica de plantillas
  const generateLetterText = () => {
    const isEn = language === 'en';
    const isFormal = templateType === 'formal';

    if (isEn) {
      if (isFormal) {
        return `Subject: Application for ${jobTitle} - Visa Sponsorship & Relocation Support

Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${jobTitle} position at ${company} in ${location}. With over 3 years of hands-on professional experience developing robust software solutions using C#, .NET Core, SQL Server, and modern frontend frameworks like React and Angular, I am confident in my ability to contribute effectively to your engineering team.

In my recent roles, I have designed and maintained scalable RESTful APIs, optimized complex database schemas in SQL Server, and developed highly interactive, clean user interfaces with React. This combination of deep backend expertise and modern frontend skills allows me to own features end-to-end and deliver reliable web applications.

Regarding my immigration status: I am an Argentine citizen seeking a relocation opportunity with visa sponsorship. I would like to highlight that under the current European Union guidelines (such as the EU Blue Card directives for IT professionals in Germany or the Highly Skilled Migrant program in the Netherlands), I qualify for work visa pathways based on my proven professional experience in the tech sector, without requiring a university diploma.

I am highly motivated to bring my technical skills and proactive work ethic to ${company} and facilitate a smooth transition to ${location}. Thank you for your time and consideration. I look forward to the possibility of discussing how my experience aligns with your team's needs.

Sincerely,

[Your Name]
[LinkedIn Profile URL]
[GitHub Profile URL]`;
      } else {
        // Cold Outreach (Mensaje corto para LinkedIn / Recruiter)
        return `Hi [Recruiter Name],

I hope you're having a great week! 

I recently noticed the opening for ${jobTitle} at ${company} in ${location} and felt compelled to reach out. I am a Full Stack Developer with over 3 years of professional experience specializing in C#, .NET Core, SQL Server, and React/Angular.

I have a proven track record of building scalable APIs and creating clean frontend experiences. I am currently based in Argentina and looking to relocate to ${location}, and I am looking for opportunities that offer visa sponsorship. Please note that I fully qualify for IT work permit pathways based on professional experience under EU/national regulations.

Would you be open to a brief chat to see if my background matches what you are looking for in the team? 

Thank you!

Best regards,

[Your Name]
[LinkedIn Profile URL]`;
      }
    } else {
      // Español
      if (isFormal) {
        return `Asunto: Candidatura para ${jobTitle} - Relocalización y Patrocinio de Visado

Estimado equipo de selección de ${company},

Le escribo para manifestar mi gran interés en la posición de ${jobTitle} en ${company} para la oficina de ${location}. Cuento con más de 3 años de experiencia profesional en el desarrollo de software utilizando C#, .NET Core, SQL Server y frameworks frontend como React y Angular, por lo que estoy convencido de que puedo aportar un gran valor a su equipo de ingeniería.

A lo largo de mi trayectoria, me he especializado en diseñar y mantener APIs REST seguras, optimizar bases de datos complejas en SQL Server y construir interfaces de usuario limpias y eficientes en React. Esta combinación de habilidades me permite asumir la responsabilidad completa de las funcionalidades, desde el backend hasta el frontend.

Con respecto al aspecto migratorio: soy ciudadano argentino y requiero patrocinio de visado para incorporarme. Cabe destacar que, bajo las regulaciones vigentes en España (como la visa de Profesionales Altamente Cualificados o la nueva directiva europea de la Tarjeta Azul), cualifico plenamente para el permiso de trabajo basándome en mi experiencia laboral demostrable en el sector tecnológico, sin que sea indispensable poseer un título universitario homologado.

Agradezco de antemano su tiempo y consideración al revisar mi candidatura. Quedo a su entera disposición para mantener una entrevista y conversar sobre cómo mi perfil puede contribuir a los objetivos de ${company}.

Atentamente,

[Tu Nombre]
[Enlace a tu perfil de LinkedIn]
[Enlace a tu perfil de GitHub]`;
      } else {
        // Cold Outreach en Español
        return `Hola [Nombre del Selector/a],

¡Espero que estés muy bien!

Me pongo en contacto contigo porque vi la oferta de ${jobTitle} para ${company} en ${location} y considero que mi perfil se alinea con lo que buscan. Soy desarrollador Full Stack con más de 3 años de experiencia trabajando activamente con .NET (C#), SQL Server y React/Angular.

Me especializo en diseñar APIs robustas y crear interfaces web dinámicas. Actualmente me encuentro en Argentina y tengo como objetivo relocalizarme en ${location}. Para ello, busco posiciones que brinden patrocinio de visado. Es importante destacar que cualifico para los permisos de trabajo en el sector IT bajo la vía de experiencia profesional certificada.

¿Tendrías unos minutos para realizar una breve llamada y ver si mi perfil encaja con lo que necesita el equipo?

¡Muchas gracias por tu tiempo!

Un saludo cordial,

[Tu Nombre]
[Enlace a tu perfil de LinkedIn]`;
      }
    }
  };

  useEffect(() => {
    setGeneratedLetter(generateLetterText());
  }, [jobTitle, company, location, language, templateType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="flex-1 flex flex-col space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 class="font-display font-extrabold text-2xl md:text-3xl text-slate-100 flex items-center gap-2">
          Generador de Cover Letter
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Crea cartas de presentación profesionales y mensajes de LinkedIn adaptados para postulaciones que requieren patrocinio de visa en Europa.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Formulario de parámetros (Columna izquierda) */}
        <div class="lg:col-span-2 space-y-5">
          <div class="glass-panel rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
            <h3 class="font-display font-bold text-base text-slate-200 flex items-center gap-2 border-b border-dark-800/80 pb-3">
              <Sparkles class="w-4 h-4 text-blue-400" />
              Parámetros de Oferta
            </h3>

            {/* Puesto */}
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Briefcase class="w-3.5 h-3.5 text-slate-500" />
                Título del Puesto
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ej. Senior .NET Developer"
                class="w-full bg-dark-950 border border-dark-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Empresa */}
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Building class="w-3.5 h-3.5 text-slate-500" />
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej. Booking.com"
                class="w-full bg-dark-950 border border-dark-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Ubicación */}
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-slate-500" />
                Ubicación (País/Ciudad)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Amsterdam, Netherlands"
                class="w-full bg-dark-950 border border-dark-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Selección de Idioma */}
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Languages class="w-3.5 h-3.5 text-slate-500" />
                Idioma
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  class={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    language === 'en'
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-dark-950/60 border-dark-800 text-slate-400 hover:bg-dark-800'
                  }`}
                >
                  Inglés (Recomendado)
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  class={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    language === 'es'
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-dark-950/60 border-dark-800 text-slate-400 hover:bg-dark-800'
                  }`}
                >
                  Español
                </button>
              </div>
            </div>

            {/* Tipo de Plantilla */}
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <MessageSquare class="w-3.5 h-3.5 text-slate-500" />
                Estilo de Comunicación
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTemplateType('formal')}
                  class={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    templateType === 'formal'
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-dark-950/60 border-dark-800 text-slate-400 hover:bg-dark-800'
                  }`}
                >
                  Carta Formal (Email/Web)
                </button>
                <button
                  onClick={() => setTemplateType('cold-outreach')}
                  class={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    templateType === 'cold-outreach'
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-dark-950/60 border-dark-800 text-slate-400 hover:bg-dark-800'
                  }`}
                >
                  Contacto en Frío (Recruiter)
                </button>
              </div>
            </div>

          </div>

          {/* Guía informativa de visados */}
          <div class="glass-panel border-blue-500/10 bg-blue-950/15 rounded-2xl p-5 md:p-6 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Info class="w-4 h-4 text-blue-400 shrink-0" />
              Info: Visados Sin Título Universitario
            </h4>
            <ul class="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li class="flex items-start gap-1.5">
                <ChevronRight class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>España:</strong> La Ley de Emprendedores (visa PAC) permite acreditar la condición de profesional cualificado aportando contratos anteriores y vida laboral que demuestre +3 años de experiencia en roles afines.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <ChevronRight class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Alemania:</strong> Bajo la nueva Ley de Inmigración de Especialistas, se puede obtener la Tarjeta Azul de la UE o visa de trabajo tecnológico si se cuenta con al menos 3 años de experiencia en IT en los últimos 7 años.</span>
              </li>
              <li class="flex items-start gap-1.5">
                <ChevronRight class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Países Bajos:</strong> El programa <i>Kennismigrant</i> (Highly Skilled Migrant) no exige título para el visado si el salario pactado cumple el umbral legal para menores/mayores de 30 años.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Visualizador del texto generado (Columna derecha) */}
        <div class="lg:col-span-3 flex flex-col h-full">
          <div class="glass-panel rounded-2xl p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4 shadow-xl">
            
            {/* Header visualizador */}
            <div class="flex justify-between items-center border-b border-dark-800/80 pb-3">
              <div class="flex items-center gap-2">
                <FileText class="w-4 h-4 text-emerald-400" />
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {templateType === 'formal' ? 'Cover Letter Generada' : 'Mensaje Corto LinkedIn'}
                </span>
              </div>
              
              <button
                onClick={handleCopy}
                class="flex items-center gap-1.5 px-3 py-1.5 bg-dark-950/80 hover:bg-dark-800 border border-dark-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
              >
                {copied ? (
                  <>
                    <Check class="w-3.5 h-3.5 text-emerald-400" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy class="w-3.5 h-3.5 text-slate-400" />
                    Copiar texto
                  </>
                )}
              </button>
            </div>

            {/* Textarea editable con la carta */}
            <textarea
              value={generatedLetter}
              onChange={(e) => setGeneratedLetter(e.target.value)}
              class="w-full flex-1 bg-dark-950/40 border border-dark-800/60 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/30 leading-relaxed resize-none min-h-[380px] lg:min-h-[420px]"
            />

            {/* Aviso */}
            <p class="text-[10px] text-slate-500 italic text-center">
              * Recuerda reemplazar los campos entre corchetes <code class="text-blue-400 font-mono">[ ]</code> con tus datos personales antes de enviar.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}

export default CoverLetter;
