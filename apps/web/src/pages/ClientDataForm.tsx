import { useState } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { Badge } from '@/components/ui/Badge';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { KpiCard } from '@/components/ui/KpiCard';
import { Building2, Users, Database, Shield, FileCheck, Scale, ClipboardCheck, Send } from 'lucide-react';

const STEPS = [
  { key: 'empresa', label: '1. Empresa', icon: Building2 },
  { key: 'responsable', label: '2. Responsable', icon: Users },
  { key: 'tratamientos', label: '3. Tratamientos', icon: Database },
  { key: 'seguridad', label: '4. Seguridad', icon: Shield },
  { key: 'derechos', label: '5. Derechos', icon: Scale },
  { key: 'documentacion', label: '6. Documentación', icon: FileCheck },
  { key: 'evaluacion', label: '7. Evaluación', icon: ClipboardCheck },
  { key: 'envio', label: '8. Envío', icon: Send },
];

export function ClientDataForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = currentStep < STEPS.length - 1;
  const canPrev = currentStep > 0;

  return (
    <div>
      <ModuleHeader
        ciclo="FORMULARIO DE REGISTRO LOPDP"
        title="Portal de Clientes LEXDATA IA"
        subtitle="Complete el wizard de 7 secciones para obtener su cotización personalizada SGPDP con análisis Pd-VaR."
      />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <button
              key={step.key}
              onClick={() => setCurrentStep(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-slate-50 text-slate-500 border border-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {step.label}
              {isCompleted && <Badge variant="verificado">OK</Badge>}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Paso {currentStep + 1} de {STEPS.length}</span>
          <span>{Math.round(((currentStep) / STEPS.length) * 100)}% completado</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        {/* Step 1: Empresa */}
        {currentStep === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Datos de la Empresa</h3>
            <NormativeBanner tone="info">
              Información requerida conforme al Art. 37 LOPDP para el registro del responsable de tratamiento.
            </NormativeBanner>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Razón Social *</label>
                <input
                  value={formData.razonSocial ?? ''}
                  onChange={(e) => updateField('razonSocial', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="Nombre legal de la empresa"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">RUC *</label>
                <input
                  value={formData.ruc ?? ''}
                  onChange={(e) => updateField('ruc', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="13 dígitos"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Sector Económico *</label>
                <select
                  value={formData.sector ?? ''}
                  onChange={(e) => updateField('sector', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Seleccione…</option>
                  <option value="FINANCIERO">Financiero</option>
                  <option value="SALUD">Salud</option>
                  <option value="EDUCACION">Educación</option>
                  <option value="COMERCIO">Comercio</option>
                  <option value="TECNOLOGIA">Tecnología</option>
                  <option value="GOBIERNO">Gobierno</option>
                  <option value="TELECOMUNICACIONES">Telecomunicaciones</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Ciudad *</label>
                <input
                  value={formData.ciudad ?? ''}
                  onChange={(e) => updateField('ciudad', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="Ciudad principal"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Número de empleados *</label>
                <select
                  value={formData.empleados ?? ''}
                  onChange={(e) => updateField('empleados', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Seleccione…</option>
                  <option value="1-10">1 – 10</option>
                  <option value="11-50">11 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="500+">Más de 500</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Correo de contacto *</label>
                <input
                  value={formData.email ?? ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  placeholder="contacto@empresa.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Responsable */}
        {currentStep === 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Datos del Responsable / DPO</h3>
            <NormativeBanner tone="info">
              Art. 48 LOPDP · Designación del Delegado de Protección de Datos — Obligatorio para entidades
              del sector público y empresas que traten datos sensibles a gran escala.
            </NormativeBanner>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre completo *</label>
                <input
                  value={formData.dpoNombre ?? ''}
                  onChange={(e) => updateField('dpoNombre', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cargo *</label>
                <input
                  value={formData.dpoCargo ?? ''}
                  onChange={(e) => updateField('dpoCargo', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Correo electrónico *</label>
                <input
                  value={formData.dpoEmail ?? ''}
                  onChange={(e) => updateField('dpoEmail', e.target.value)}
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Teléfono</label>
                <input
                  value={formData.dpoTelefono ?? ''}
                  onChange={(e) => updateField('dpoTelefono', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Tiene DPO designado?</label>
                <div className="flex gap-3">
                  {['Sí, designado', 'No, pendiente', 'Externalizado'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField('tieneDpo', opt)}
                      className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                        formData.tieneDpo === opt ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tratamientos */}
        {currentStep === 2 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Tratamientos de Datos Personales</h3>
            <NormativeBanner tone="info">
              Art. 37 LOPDP · Indique los tipos de datos que trata su organización y las actividades de tratamiento principales.
            </NormativeBanner>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">Tipos de datos que trata *</label>
                <div className="flex flex-wrap gap-2">
                  {['Identificación', 'Contacto', 'Financieros', 'Laborales', 'Salud', 'Biométricos', 'Menores', 'Geolocalización', 'Ideología/Religión'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => {
                        const current = formData.tiposDatos ?? [];
                        updateField('tiposDatos', current.includes(tipo) ? current.filter((t: string) => t !== tipo) : [...current, tipo]);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        (formData.tiposDatos ?? []).includes(tipo)
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">Volumen estimado de registros</label>
                <select
                  value={formData.volumen ?? ''}
                  onChange={(e) => updateField('volumen', e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">Seleccione…</option>
                  <option value="<1000">Menos de 1,000</option>
                  <option value="1000-10000">1,000 – 10,000</option>
                  <option value="10000-100000">10,000 – 100,000</option>
                  <option value="100000+">Más de 100,000</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-600">Realiza transferencias internacionales?</label>
                <div className="flex gap-3">
                  {['Sí', 'No', 'No estoy seguro'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField('transferenciasInt', opt)}
                      className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                        formData.transferenciasInt === opt ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Steps 4-7: Placeholder sections */}
        {currentStep >= 3 && currentStep <= 6 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">{STEPS[currentStep]!.label.replace(/^\d+\.\s*/, '')}</h3>
            <div className="flex flex-col items-center justify-center py-12">
              {(() => { const Icon = STEPS[currentStep]!.icon; return <Icon className="mb-3 h-10 w-10 text-slate-300" />; })()}
              <p className="text-sm text-slate-500">
                Sección de {STEPS[currentStep]!.label.replace(/^\d+\.\s*/, '')} — Complete los campos requeridos para continuar.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Esta sección se habilitará conforme avance el formulario.
              </p>
            </div>
          </div>
        )}

        {/* Step 8: Envío */}
        {currentStep === 7 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Revisión y Envío</h3>
            <NormativeBanner tone="info">
              Revise la información proporcionada antes de enviar. Su solicitud generará un análisis Pd-VaR
              y una cotización personalizada para el SGPDP.
            </NormativeBanner>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard label="EMPRESA" value={formData.razonSocial || '—'} sub={formData.ruc || 'Sin RUC'} icon={Building2} />
              <KpiCard label="SECTOR" value={formData.sector || '—'} sub={formData.ciudad || '—'} icon={Building2} />
              <KpiCard label="TIPOS DE DATOS" value={(formData.tiposDatos ?? []).length} sub="categorías seleccionadas" icon={Database} />
              <KpiCard label="DPO" value={formData.tieneDpo || '—'} sub={formData.dpoNombre || '—'} icon={Users} />
            </div>
            <div className="flex justify-center">
              <button className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition">
                Enviar Formulario
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">
              Al enviar, acepta que LEXDATA IA procese estos datos para generar su diagnóstico y cotización SGPDP.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={!canPrev}
            className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
              canPrev ? 'border-slate-300 text-slate-600 hover:bg-slate-50' : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            Anterior
          </button>
          <span className="text-xs text-slate-400">
            {currentStep + 1} / {STEPS.length}
          </span>
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canNext}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
              canNext ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
