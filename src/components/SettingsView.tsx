import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, RotateCcw, Smartphone, ShieldCheck, CheckCircle } from 'lucide-react';
import { SESSIONS_LIST } from '../data/initialData';

export const SettingsView: React.FC<{ onOpenVercelModal: () => void }> = ({ onOpenVercelModal }) => {
  const { config, updateConfig, resetToDefaults, role } = useApp();
  const [formData, setFormData] = useState({ ...config });
  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {savedToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl text-sm font-semibold">
          <CheckCircle size={18} />
          <span>School configuration saved successfully!</span>
        </div>
      )}

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Institution Settings & System Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Customize official school credentials, active academic session, and passing criteria.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              School / Institution Name
            </label>
            <input
              type="text"
              disabled={role !== 'admin'}
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                UDISE / School Code
              </label>
              <input
                type="text"
                disabled={role !== 'admin'}
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Academic Session
              </label>
              <select
                disabled={role !== 'admin'}
                value={formData.activeSession}
                onChange={(e) => setFormData({ ...formData, activeSession: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {SESSIONS_LIST.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Postal Address
            </label>
            <input
              type="text"
              disabled={role !== 'admin'}
              value={formData.schoolAddress}
              onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email & UDISE Information
              </label>
              <input
                type="text"
                disabled={role !== 'admin'}
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Passing Threshold (%)
              </label>
              <input
                type="number"
                min="25"
                max="50"
                step="0.5"
                disabled={role !== 'admin'}
                value={formData.passingPercentage}
                onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {role === 'admin' && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow transition"
              >
                <Save size={16} />
                <span>Save School Configuration</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Deployment & Companion App Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold flex items-center gap-2">
            <Smartphone className="text-indigo-400" size={20} />
            <span>Dual Deployment: Vercel Web Portal & Android Mobile App</span>
          </h4>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            This project is pre-configured with both high-performance Vercel Web deployment (`vercel.json`) and a native Android application (`com.example` Kotlin/Compose).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenVercelModal}
            className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 shadow transition"
          >
            Vercel Deployment Guide
          </button>
        </div>
      </div>

      {/* Data Management & Reset */}
      <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
            Reset All Data to Factory Defaults
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
            Restores initial sample data for students, assessments, and marks entries.
          </p>
        </div>
        <button
          onClick={async () => {
            if (confirm('Are you sure you want to reset all data to default samples?')) {
              await resetToDefaults();
              setSavedToast(true);
              setTimeout(() => setSavedToast(false), 3000);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow transition"
        >
          <RotateCcw size={15} />
          <span>Reset Sample Data</span>
        </button>
      </div>
    </div>
  );
};
