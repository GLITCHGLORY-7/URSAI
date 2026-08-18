import React, { useState, useEffect } from 'react';
import { useUrsai } from '../../context/UrsaiContext';
import { IncidentType, Severity } from '../../types/ursai';
import { INCIDENT_TYPES, SEVERITY_LEVELS } from '../../incidents/incidentTypes';
import { validateIncidentInput, ValidationResult } from '../../incidents/incidentValidation';
import { X, MapPin, AlertCircle, CheckCircle, ShieldAlert, Car, Flame, Waves, OctagonAlert } from 'lucide-react';

interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Car,
  Flame,
  Waves,
  OctagonAlert,
};

export const IncidentForm: React.FC<IncidentFormProps> = ({ isOpen, onClose }) => {
  const { state, submitIncident, setMapSelectionMode } = useUrsai();
  const { activeIncident, mapSelection } = state;

  const [type, setType] = useState<IncidentType | ''>('ROAD ACCIDENT');
  const [severity, setSeverity] = useState<Severity | ''>('HIGH');
  const [latitude, setLatitude] = useState<string>('13.0827');
  const [longitude, setLongitude] = useState<string>('80.2707');
  const [description, setDescription] = useState<string>('Emergency vehicular collision reported at intersection.');
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [warning, setWarning] = useState<string | undefined>();

  // Sync selected location from map click into inputs
  useEffect(() => {
    if (mapSelection.selectedLocation) {
      setLatitude(mapSelection.selectedLocation.lat.toString());
      setLongitude(mapSelection.selectedLocation.lng.toString());
    }
  }, [mapSelection.selectedLocation]);

  if (!isOpen) return null;

  const handleToggleMapPick = () => {
    setMapSelectionMode(!mapSelection.isSelectingLocation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    const validation = validateIncidentInput({
      type,
      severity,
      latitude: isNaN(parsedLat) ? null : parsedLat,
      longitude: isNaN(parsedLng) ? null : parsedLng,
      description,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setWarning(validation.warningMessage);
      return;
    }

    const result = submitIncident({
      type: type as IncidentType,
      severity: severity as Severity,
      latitude: parsedLat,
      longitude: parsedLng,
      description,
    });

    if (result.success) {
      setMapSelectionMode(false);
      onClose();
    } else if (result.validation) {
      setErrors(result.validation.errors);
      setWarning(result.validation.warningMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden font-mono text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm tracking-wide">NEW OPERATOR INCIDENT REPORT</span>
          </div>
          <button
            onClick={() => {
              setMapSelectionMode(false);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Active Incident Warning */}
          {activeIncident && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">ACTIVE INCIDENT EXISTS ({activeIncident.id})</p>
                <p className="font-sans text-[11px] text-red-200 mt-0.5">
                  URSAI Phase 1–3 model supports 1 active incident at a time. Please click RESET before creating a new incident.
                </p>
              </div>
            </div>
          )}

          {/* 1. Incident Type */}
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1.5">
              1. Incident Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INCIDENT_TYPES.map((t) => {
                const IconComponent = TYPE_ICONS[t.icon] || Car;
                const isSelected = type === t.type;
                return (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => {
                      setType(t.type);
                      setErrors((prev) => ({ ...prev, type: undefined }));
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-red-950/80 border-red-600 text-red-200 shadow-md shadow-red-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-[11px]">{t.type}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.type && <p className="text-red-400 text-[11px] mt-1">{errors.type}</p>}
          </div>

          {/* 2. Severity */}
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1.5">
              2. Severity Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITY_LEVELS.map((s) => {
                const isSelected = severity === s.severity;
                return (
                  <button
                    key={s.severity}
                    type="button"
                    onClick={() => {
                      setSeverity(s.severity);
                      setErrors((prev) => ({ ...prev, severity: undefined }));
                    }}
                    className={`py-2 px-1 text-center rounded border font-bold text-[10px] tracking-wider transition-all ${
                      isSelected
                        ? `${s.bgClass} shadow-md`
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {s.severity}
                  </button>
                );
              })}
            </div>
            {errors.severity && <p className="text-red-400 text-[11px] mt-1">{errors.severity}</p>}
          </div>

          {/* 3. Location Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-400 uppercase font-semibold">
                3. Incident Coordinates <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleToggleMapPick}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold transition-all ${
                  mapSelection.isSelectingLocation
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{mapSelection.isSelectingLocation ? 'SELECTING ON MAP...' : 'SELECT ON MAP'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Latitude (-90 to 90)</span>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    setErrors((prev) => ({ ...prev, latitude: undefined, location: undefined }));
                  }}
                  placeholder="13.0827"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block mb-0.5">Longitude (-180 to 180)</span>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    setErrors((prev) => ({ ...prev, longitude: undefined, location: undefined }));
                  }}
                  placeholder="80.2707"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {errors.location && <p className="text-red-400 text-[11px] mt-1">{errors.location}</p>}
            {errors.latitude && <p className="text-red-400 text-[11px] mt-1">{errors.latitude}</p>}
            {errors.longitude && <p className="text-red-400 text-[11px] mt-1">{errors.longitude}</p>}

            {/* Warning Message if any */}
            {warning && (
              <p className="text-amber-400 text-[10px] bg-amber-950/40 p-2 rounded border border-amber-800/60 mt-2 font-sans">
                {warning}
              </p>
            )}
          </div>

          {/* 4. Description */}
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1.5">
              4. Incident Summary / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe caller observations, street markers, injuries, or hazards..."
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-100 font-sans text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMapSelectionMode(false);
                onClose();
              }}
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!!activeIncident}
              className={`px-5 py-2 rounded font-bold flex items-center gap-2 shadow-lg transition-all ${
                activeIncident
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>DISPATCH EMERGENCY SWARM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
