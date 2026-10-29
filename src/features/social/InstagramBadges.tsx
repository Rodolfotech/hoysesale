'use client';

import { CheckCircle, AlertTriangle, TrendingUp, Award } from 'lucide-react';

interface InstagramBadgesProps {
  validation: {
    isProfessional: boolean;
    hasMinAge: boolean;
    hasMinPosts: boolean;
    level: number;
  } | null;
}

export function InstagramBadges({ validation }: InstagramBadgesProps) {
  if (!validation) return null;

  return (
    <div className="flex flex-wrap justify-center gap-1 mt-2">
      {validation.isProfessional ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Profesional
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Personal
        </span>
      )}
      {validation.hasMinAge ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" />
          +6 meses
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Cuenta nueva
        </span>
      )}
      {validation.hasMinPosts ? (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +5 posts
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          Poca actividad
        </span>
      )}
      <span className="inline-flex items-center gap-1 text-xs text-neon-cyan bg-white/5 px-2 py-0.5 rounded-full">
        <Award className="w-3 h-3" />
        Nivel {validation.level}
      </span>
    </div>
  );
}
