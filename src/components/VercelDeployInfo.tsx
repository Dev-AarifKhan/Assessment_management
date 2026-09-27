import React from 'react';
import { CheckCircle2, Globe, Terminal, Sparkles, X, ExternalLink, ShieldCheck } from 'lucide-react';

export const VercelDeployInfo: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-sm">
              ▲
            </div>
            <div>
              <h3 className="font-bold text-base">Vercel Deployment Ready</h3>
              <p className="text-xs text-indigo-200">Zero-configuration build & hosting for GHSS Larnoo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {/* Status highlight */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                All Vercel Deployment Pre-requisites Configured
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Your repository contains a verified <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono font-semibold">vercel.json</code>, optimized production build scripts in <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono font-semibold">package.json</code>, clean <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono font-semibold">.vercelignore</code>, and the complete web suite for GHSS Larnoo.
              </p>
            </div>
          </div>

          {/* Quick Steps */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
              How to Deploy to Vercel (2 Minutes):
            </h4>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">1</span>
                  <span>Push or Export Code to GitHub</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">
                  Click the <strong>GitHub / Export</strong> option in the top right menu of AI Studio to push this project to your GitHub repository.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">2</span>
                  <span>Import Project in Vercel Dashboard</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">
                  Visit <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">vercel.com/new</a>, select your repository, and click <strong>Deploy</strong>. Vercel automatically detects Vite with output directory <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">dist</code>.
                </p>
              </div>

              {/* Step 3 (CLI Alternative) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Terminal size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Alternative: Deploy directly via Vercel CLI</span>
                </div>
                <div className="mt-2 pl-6">
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                    npm install -g vercel{"\n"}vercel deploy --prod
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Features in this build */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/30">
            <h5 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-2">
              Features Included in the Vercel Web Deployment:
            </h5>
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Classwise Award Roll PDF with Watermark</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Student Marksheet / Transcript Generator</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Interactive Grading & Marks Entry</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Role Switcher: Admin & Teacher</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>High-Contrast Light & Dark Theme</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Student Identity Card Creator</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
