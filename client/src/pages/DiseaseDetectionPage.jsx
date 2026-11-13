import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Bug,
  Upload,
  Image as ImageIcon,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileQuestion,
  Info,
  X,
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const COMMON_CROPS = [
  'Tomato',
  'Rice (Paddy)',
  'Wheat',
  'Cotton',
  'Maize (Corn)',
  'Chili (Pepper)',
  'Potato',
  'Soybean',
  'Sugarcane',
  'Groundnut',
];

export const DiseaseDetectionPage = () => {
  const queryClient = useQueryClient();

  const [cropName, setCropName] = useState('Tomato');
  const [plantPart, setPlantPart] = useState('Leaf');
  const [symptoms, setSymptoms] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const diagnoseMutation = useMutation({
    mutationFn: (formData) => api.diagnoseDisease(formData),
    onSuccess: (res) => {
      setDiagnosisResult(res.data);
      setErrorMsg(null);
      queryClient.invalidateQueries(['disease-history']);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Disease diagnosis failed');
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDiagnosisResult(null);
      setErrorMsg(null);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cropName) {
      setErrorMsg('Please specify the crop name');
      return;
    }

    const formData = new FormData();
    formData.append('crop_name', cropName);
    formData.append('plant_part', plantPart);
    formData.append('symptoms', symptoms);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    diagnoseMutation.mutate(formData);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
          <Bug className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Crop Health & Disease Identification</h2>
          <p className="text-xs text-slate-500 font-medium">
            Multimodal visual inspection and safe Integrated Pest Management (IPM) advisory
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload and Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Upload Plant Specimen
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Leaf / Affected Plant Photo
              </label>

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-56 bg-slate-50 flex items-center justify-center">
                  <img src={previewUrl} alt="Crop specimen" className="max-h-56 object-contain w-full" />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
                  <span className="text-[11px] text-slate-400 mt-1">JPG, PNG, or WebP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Crop *
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Affected Plant Part
              </label>
              <select
                value={plantPart}
                onChange={(e) => setPlantPart(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Leaf">Leaf / Foliage</option>
                <option value="Stem">Stem / Branch</option>
                <option value="Fruit">Fruit / Pod / Grain</option>
                <option value="Root">Root Zone</option>
                <option value="Flower">Flower / Panicle</option>
                <option value="Whole Plant">Whole Plant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observed Symptoms (Optional context)
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Yellow target spots with concentric rings appearing on lower leaves after rain"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={diagnoseMutation.isPending}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{diagnoseMutation.isPending ? 'Diagnosing Pathogen...' : 'Run Disease Identification'}</span>
            </button>
          </form>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-5">
          {diagnoseMutation.isPending && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
              <LoadingSpinner text="Analyzing leaf pathology with Gemini Vision model..." size="lg" />
            </div>
          )}

          {!diagnoseMutation.isPending && !diagnosisResult && (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Upload a Plant Photo</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Take a clear close-up picture of the affected leaf, stem, or fruit in natural daylight. The AI will inspect visible lesions and provide certified organic & safe management steps.
              </p>
            </div>
          )}

          {!diagnoseMutation.isPending && diagnosisResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Provisional Diagnosis
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {diagnosisResult.possible_diagnoses?.[0]?.name || 'Pathology Evaluation'}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Crop: {cropName}</span>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider inline-block ${
                      diagnosisResult.possible_diagnoses?.[0]?.confidence === 'high'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {diagnosisResult.possible_diagnoses?.[0]?.confidence || 'Medium'} Confidence
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Image Quality: {diagnosisResult.image_quality}
                  </span>
                </div>
              </div>

              {/* Visible Symptoms */}
              {diagnosisResult.possible_diagnoses?.[0]?.visible_symptoms?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Visible Symptoms Detected
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {diagnosisResult.possible_diagnoses[0].visible_symptoms.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Causes */}
              {diagnosisResult.possible_diagnoses?.[0]?.possible_causes?.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Underlying Causes:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {diagnosisResult.possible_diagnoses[0].possible_causes.join(', ')}
                  </p>
                </div>
              )}

              {/* Safe Management Steps */}
              {diagnosisResult.possible_diagnoses?.[0]?.management_steps?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Safe Management & Spray Protocol (IPM)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {diagnosisResult.possible_diagnoses[0].management_steps.map((m, i) => (
                      <li key={i} className="flex items-start space-x-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                        <span className="text-emerald-600 font-bold">{i + 1}.</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preventive Measures */}
              {diagnosisResult.possible_diagnoses?.[0]?.prevention?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Preventive Field Hygiene</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {diagnosisResult.possible_diagnoses[0].prevention.map((p, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-slate-400 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 text-amber-900 rounded-2xl text-[11px] leading-relaxed">
                <strong>Agronomic Notice:</strong> {diagnosisResult.disclaimer || 'Provisional diagnosis based on image analysis. Verify with your local agricultural officer before spraying.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
