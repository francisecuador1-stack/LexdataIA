import { useState, useCallback, useMemo } from 'react';
import { ModuleHeader } from '@/components/ModuleHeader';
import { Badge } from '@/components/ui/Badge';
import { NormativeBanner } from '@/components/ui/NormativeBanner';
import { KpiCard } from '@/components/ui/KpiCard';
import {
  Building2, Users, Database, Shield, FileCheck, Scale,
  ClipboardCheck, Send, FlaskConical, Trash2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Steps definition
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Required fields per step (for validation)
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS: Record<string, string[]> = {
  empresa: ['razonSocial', 'ruc', 'sector', 'ciudad', 'empleados', 'email'],
  responsable: ['dpoNombre', 'dpoCargo', 'dpoEmail', 'tieneDpo'],
  tratamientos: ['tiposDatos', 'volumen', 'transferenciasInt'],
  seguridad: ['cifradoReposo', 'cifradoTransito', 'controlAcceso', 'dobleFactorAuth', 'respaldos', 'registroAuditoria', 'planRespuestaIncidentes'],
  derechos: ['procedimientoArco', 'canalSolicitudes', 'plazoRespuesta', 'consentimientoDocumentado', 'avisoPrivacidad'],
  documentacion: ['politicaPrivacidad', 'protocoloBrechas', 'contratosEncargados', 'registroTratamientos'],
  evaluacion: ['decisionesAutomatizadas', 'perfilamiento', 'videovigilancia', 'encargadoExterno', 'auditoriaInterna', 'capacitacionAnual'],
};

// ---------------------------------------------------------------------------
// Demo data — CLINICA HORIZONTE
// ---------------------------------------------------------------------------
const DEMO_DATA: Record<string, unknown> = {
  razonSocial: 'DEMO CLINICA HORIZONTE S.A.',
  ruc: '9999999999001',
  sector: 'SALUD',
  ciudad: 'Quito',
  empleados: '201-500',
  email: 'contacto@clinicahorizonte.test',
  dpoNombre: 'Dra. Andreina Almeida',
  dpoCargo: 'Delegada de Protección de Datos (externalizada)',
  dpoEmail: 'dpo@clinicahorizonte.test',
  dpoTelefono: '+593 99 000 0000',
  tieneDpo: 'Externalizado',
  tiposDatos: ['Identificación', 'Contacto', 'Laborales', 'Salud', 'Biométricos', 'Menores'],
  volumen: '10000-100000',
  transferenciasInt: 'Sí',
  cifradoReposo: 'Parcial',
  cifradoTransito: 'Sí',
  controlAcceso: 'RBAC',
  dobleFactorAuth: 'Sí',
  respaldos: 'Sí',
  registroAuditoria: 'Parcial',
  planRespuestaIncidentes: 'No',
  procedimientoArco: 'En desarrollo',
  canalSolicitudes: 'Email',
  plazoRespuesta: '15',
  consentimientoDocumentado: 'Sí',
  avisoPrivacidad: 'Sí',
  politicaPrivacidad: 'En desarrollo',
  protocoloBrechas: 'No',
  contratosEncargados: 'Parcial',
  registroTratamientos: 'En desarrollo',
  decisionesAutomatizadas: 'Sí',
  perfilamiento: 'Sí',
  videovigilancia: 'Sí',
  encargadoExterno: 'Sí',
  auditoriaInterna: 'Parcial',
  capacitacionAnual: 'Sí',
};

// ---------------------------------------------------------------------------
// Reusable field components
// ---------------------------------------------------------------------------
const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400';
const selectCls = inputCls;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-medium text-slate-600">
      {children}{required && ' *'}
    </label>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
            value === opt
              ? 'border-blue-400 bg-blue-50 text-blue-700'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ClientDataForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isDemo, setIsDemo] = useState(false);

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Step completion check
  const isStepCompleted = useCallback(
    (stepKey: string) => {
      const fields = REQUIRED_FIELDS[stepKey];
      if (!fields) return true; // envio has no required fields
      return fields.every((f) => {
        const v = formData[f];
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== '';
      });
    },
    [formData],
  );

  const incompleteSteps = useMemo(
    () => STEPS.filter((s) => REQUIRED_FIELDS[s.key] && !isStepCompleted(s.key)),
    [isStepCompleted],
  );

  const canNext = currentStep < STEPS.length - 1;
  const canPrev = currentStep > 0;
  const progressPct = Math.round(((currentStep + 1) / STEPS.length) * 100);

  const loadDemo = () => {
    setFormData({ ...DEMO_DATA });
    setIsDemo(true);
  };
  const clearForm = () => {
    setFormData({});
    setIsDemo(false);
    setCurrentStep(0);
  };

  // Helper to toggle chip in array
  const toggleArrayChip = (field: string, chip: string) => {
    const current = (formData[field] as string[] | undefined) ?? [];
    updateField(
      field,
      current.includes(chip) ? current.filter((t) => t !== chip) : [...current, chip],
    );
  };

  return (
    <div>
      <ModuleHeader
        ciclo="FORMULARIO DE REGISTRO LOPDP"
        title="Portal de Clientes LEXDATA IA"
        subtitle="Complete el wizard de 8 pasos para obtener su cotización personalizada SGPDP con análisis Pd-VaR."
      />

      {/* Demo / Clear buttons */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={loadDemo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Cargar datos demo (Salud)
        </button>
        <button
          type="button"
          onClick={clearForm}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Limpiar formulario
        </button>
        {isDemo && <Badge variant="amber">DEMO</Badge>}
      </div>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const completed = REQUIRED_FIELDS[step.key] ? isStepCompleted(step.key) : i < currentStep;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : completed
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-slate-50 text-slate-500 border border-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {step.label}
              {completed && !isActive && <Badge variant="verificado">OK</Badge>}
            </button>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Paso {currentStep + 1} de {STEPS.length}</span>
          <span>{progressPct}% completado</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        {/* ----------------------------------------------------------------- */}
        {/* Step 1: Empresa                                                   */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Datos de la Empresa</h3>
            <NormativeBanner tone="info">
              Información requerida conforme al Art. 51 LOPDP para el registro del responsable de tratamiento.
            </NormativeBanner>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FieldLabel required>Razón Social</FieldLabel>
                <input value={(formData.razonSocial as string) ?? ''} onChange={(e) => updateField('razonSocial', e.target.value)} className={inputCls} placeholder="Nombre legal de la empresa" />
              </div>
              <div>
                <FieldLabel required>RUC</FieldLabel>
                <input value={(formData.ruc as string) ?? ''} onChange={(e) => updateField('ruc', e.target.value)} className={inputCls} placeholder="13 dígitos" maxLength={13} />
              </div>
              <div>
                <FieldLabel required>Sector Económico</FieldLabel>
                <select value={(formData.sector as string) ?? ''} onChange={(e) => updateField('sector', e.target.value)} className={selectCls}>
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
                <FieldLabel required>Ciudad</FieldLabel>
                <input value={(formData.ciudad as string) ?? ''} onChange={(e) => updateField('ciudad', e.target.value)} className={inputCls} placeholder="Ciudad principal" />
              </div>
              <div>
                <FieldLabel required>Número de empleados</FieldLabel>
                <select value={(formData.empleados as string) ?? ''} onChange={(e) => updateField('empleados', e.target.value)} className={selectCls}>
                  <option value="">Seleccione…</option>
                  <option value="1-10">1 – 10</option>
                  <option value="11-50">11 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="500+">Más de 500</option>
                </select>
              </div>
              <div>
                <FieldLabel required>Correo de contacto</FieldLabel>
                <input value={(formData.email as string) ?? ''} onChange={(e) => updateField('email', e.target.value)} type="email" className={inputCls} placeholder="contacto@empresa.com" />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 2: Responsable                                               */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Datos del Responsable / DPO</h3>
            <NormativeBanner tone="info">
              Art. 48 LOPDP · Designación del Delegado de Protección de Datos — Obligatorio para entidades
              del sector público y empresas que traten datos sensibles a gran escala.
            </NormativeBanner>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <FieldLabel required>Nombre completo</FieldLabel>
                <input value={(formData.dpoNombre as string) ?? ''} onChange={(e) => updateField('dpoNombre', e.target.value)} className={inputCls} />
              </div>
              <div>
                <FieldLabel required>Cargo</FieldLabel>
                <input value={(formData.dpoCargo as string) ?? ''} onChange={(e) => updateField('dpoCargo', e.target.value)} className={inputCls} />
              </div>
              <div>
                <FieldLabel required>Correo electrónico</FieldLabel>
                <input value={(formData.dpoEmail as string) ?? ''} onChange={(e) => updateField('dpoEmail', e.target.value)} type="email" className={inputCls} />
              </div>
              <div>
                <FieldLabel>Teléfono</FieldLabel>
                <input value={(formData.dpoTelefono as string) ?? ''} onChange={(e) => updateField('dpoTelefono', e.target.value)} className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <FieldLabel required>Tiene DPO designado?</FieldLabel>
                <ChipGroup
                  options={['Sí, designado', 'No, pendiente', 'Externalizado']}
                  value={formData.tieneDpo as string | undefined}
                  onChange={(v) => updateField('tieneDpo', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 3: Tratamientos                                              */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Tratamientos de Datos Personales</h3>
            <NormativeBanner tone="info">
              Art. 51 LOPDP · Indique los tipos de datos que trata su organización y las actividades de tratamiento principales.
            </NormativeBanner>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Tipos de datos que trata</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {['Identificación', 'Contacto', 'Financieros', 'Laborales', 'Salud', 'Biométricos', 'Menores', 'Geolocalización', 'Ideología/Religión'].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => toggleArrayChip('tiposDatos', tipo)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        ((formData.tiposDatos as string[]) ?? []).includes(tipo)
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
                <FieldLabel required>Volumen estimado de registros</FieldLabel>
                <select value={(formData.volumen as string) ?? ''} onChange={(e) => updateField('volumen', e.target.value)} className={`${selectCls} max-w-xs`}>
                  <option value="">Seleccione…</option>
                  <option value="<1000">Menos de 1,000</option>
                  <option value="1000-10000">1,000 – 10,000</option>
                  <option value="10000-100000">10,000 – 100,000</option>
                  <option value="100000+">Más de 100,000</option>
                </select>
              </div>
              <div>
                <FieldLabel required>Realiza transferencias internacionales?</FieldLabel>
                <ChipGroup
                  options={['Sí', 'No', 'No estoy seguro']}
                  value={formData.transferenciasInt as string | undefined}
                  onChange={(v) => updateField('transferenciasInt', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 4: Seguridad                                                 */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Medidas de Seguridad</h3>
            <NormativeBanner tone="info">
              Art. 37 LOPDP · Medidas de seguridad — El responsable adoptará las medidas técnicas y organizativas apropiadas.
            </NormativeBanner>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Cifrado en reposo</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'Parcial']} value={formData.cifradoReposo as string | undefined} onChange={(v) => updateField('cifradoReposo', v)} />
              </div>
              <div>
                <FieldLabel required>Cifrado en tránsito</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'Parcial']} value={formData.cifradoTransito as string | undefined} onChange={(v) => updateField('cifradoTransito', v)} />
              </div>
              <div>
                <FieldLabel required>Control de acceso</FieldLabel>
                <ChipGroup options={['RBAC', 'Usuario+contraseña', 'Sin control']} value={formData.controlAcceso as string | undefined} onChange={(v) => updateField('controlAcceso', v)} />
              </div>
              <div>
                <FieldLabel required>Doble factor de autenticación</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.dobleFactorAuth as string | undefined} onChange={(v) => updateField('dobleFactorAuth', v)} />
              </div>
              <div>
                <FieldLabel required>Respaldos periódicos</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.respaldos as string | undefined} onChange={(v) => updateField('respaldos', v)} />
              </div>
              <div>
                <FieldLabel required>Registro de auditoría</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'Parcial']} value={formData.registroAuditoria as string | undefined} onChange={(v) => updateField('registroAuditoria', v)} />
              </div>
              <div>
                <FieldLabel required>Plan de respuesta a incidentes</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.planRespuestaIncidentes as string | undefined} onChange={(v) => updateField('planRespuestaIncidentes', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 5: Derechos                                                  */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Derechos del Titular</h3>
            <NormativeBanner tone="info">
              Arts. 12-20 LOPDP · Derechos del titular — Todo titular tiene derecho de acceso, rectificación, eliminación y oposición.
            </NormativeBanner>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Procedimiento ARCO implementado</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'En desarrollo']} value={formData.procedimientoArco as string | undefined} onChange={(v) => updateField('procedimientoArco', v)} />
              </div>
              <div>
                <FieldLabel required>Canal de solicitudes</FieldLabel>
                <ChipGroup options={['Email', 'Web', 'Presencial', 'No tiene']} value={formData.canalSolicitudes as string | undefined} onChange={(v) => updateField('canalSolicitudes', v)} />
              </div>
              <div>
                <FieldLabel required>Plazo de respuesta a solicitudes</FieldLabel>
                <select value={(formData.plazoRespuesta as string) ?? ''} onChange={(e) => updateField('plazoRespuesta', e.target.value)} className={`${selectCls} max-w-xs`}>
                  <option value="">Seleccione…</option>
                  <option value="5">5 días</option>
                  <option value="10">10 días</option>
                  <option value="15">15 días</option>
                  <option value="No definido">No definido</option>
                </select>
              </div>
              <div>
                <FieldLabel required>Consentimiento documentado</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.consentimientoDocumentado as string | undefined} onChange={(v) => updateField('consentimientoDocumentado', v)} />
              </div>
              <div>
                <FieldLabel required>Aviso de privacidad</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'En desarrollo']} value={formData.avisoPrivacidad as string | undefined} onChange={(v) => updateField('avisoPrivacidad', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 6: Documentación                                             */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 5 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Marco Documental</h3>
            <NormativeBanner tone="info">
              Art. 37 y 42 LOPDP · Documentación del SGPDP — El marco documental evidencia el cumplimiento del principio de responsabilidad proactiva.
            </NormativeBanner>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Política de privacidad</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'En desarrollo']} value={formData.politicaPrivacidad as string | undefined} onChange={(v) => updateField('politicaPrivacidad', v)} />
              </div>
              <div>
                <FieldLabel required>Protocolo de brechas</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'En desarrollo']} value={formData.protocoloBrechas as string | undefined} onChange={(v) => updateField('protocoloBrechas', v)} />
              </div>
              <div>
                <FieldLabel required>Contratos con encargados</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'Parcial']} value={formData.contratosEncargados as string | undefined} onChange={(v) => updateField('contratosEncargados', v)} />
              </div>
              <div>
                <FieldLabel required>Registro de tratamientos</FieldLabel>
                <ChipGroup options={['Sí', 'No', 'En desarrollo']} value={formData.registroTratamientos as string | undefined} onChange={(v) => updateField('registroTratamientos', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 7: Evaluación                                                */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 6 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Evaluación de Riesgos</h3>
            <NormativeBanner tone="info">
              Arts. 20-21, 42 LOPDP · Evaluación de riesgos — Identificar si existen tratamientos que requieran EIPD obligatoria.
            </NormativeBanner>
            <div className="space-y-4">
              <div>
                <FieldLabel required>Decisiones automatizadas</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.decisionesAutomatizadas as string | undefined} onChange={(v) => updateField('decisionesAutomatizadas', v)} />
              </div>
              <div>
                <FieldLabel required>Perfilamiento</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.perfilamiento as string | undefined} onChange={(v) => updateField('perfilamiento', v)} />
              </div>
              <div>
                <FieldLabel required>Videovigilancia</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.videovigilancia as string | undefined} onChange={(v) => updateField('videovigilancia', v)} />
              </div>
              <div>
                <FieldLabel required>Encargado externo de tratamiento</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.encargadoExterno as string | undefined} onChange={(v) => updateField('encargadoExterno', v)} />
              </div>
              <div>
                <FieldLabel required>Auditoría interna realizada</FieldLabel>
                <ChipGroup options={['Sí', 'Parcial', 'No']} value={formData.auditoriaInterna as string | undefined} onChange={(v) => updateField('auditoriaInterna', v)} />
              </div>
              <div>
                <FieldLabel required>Capacitación anual en protección de datos</FieldLabel>
                <ChipGroup options={['Sí', 'No']} value={formData.capacitacionAnual as string | undefined} onChange={(v) => updateField('capacitacionAnual', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 8: Envío                                                     */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 7 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Revisión y Envío</h3>
            <NormativeBanner tone="info">
              Revise la información proporcionada antes de enviar. Su solicitud generará un análisis Pd-VaR
              y una cotización personalizada para el SGPDP.
            </NormativeBanner>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard label="EMPRESA" value={(formData.razonSocial as string) || '—'} sub={(formData.ruc as string) || 'Sin RUC'} icon={Building2} />
              <KpiCard label="SECTOR" value={(formData.sector as string) || '—'} sub={(formData.ciudad as string) || '—'} icon={Building2} />
              <KpiCard label="TIPOS DE DATOS" value={((formData.tiposDatos as string[]) ?? []).length} sub="categorías seleccionadas" icon={Database} />
              <KpiCard label="DPO" value={(formData.tieneDpo as string) || '—'} sub={(formData.dpoNombre as string) || '—'} icon={Users} />
            </div>

            {/* Summary table */}
            <div className="mb-6 rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Sección</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {STEPS.filter((s) => REQUIRED_FIELDS[s.key]).map((step) => {
                    const completed = isStepCompleted(step.key);
                    return (
                      <tr key={step.key} className="border-t border-slate-100">
                        <td className="px-4 py-2 text-slate-700">{step.label}</td>
                        <td className="px-4 py-2">
                          {completed ? (
                            <Badge variant="verificado">Completo</Badge>
                          ) : (
                            <Badge variant="pendiente">Incompleto</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {incompleteSteps.length > 0 && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                Faltan campos obligatorios en: {incompleteSteps.map((s) => s.label).join(', ')}.
                Complete todas las secciones antes de enviar.
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                disabled={incompleteSteps.length > 0}
                className={`rounded-lg px-8 py-3 text-sm font-medium transition ${
                  incompleteSteps.length > 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
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
            type="button"
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
            type="button"
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
