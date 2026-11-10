import type { ReactNode } from 'react';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';

export const legalHeading = { color: '#1D1D1F' };
export const legalLink = { color: '#2563EB' };

interface LegalPageProps {
  title: string;
  version: string;
  date: string;
  intro: ReactNode;
  sections: AccordionItem[];
}

// Página legal (privacidad, términos, eliminación de datos): versión y fecha visibles, y secciones en acordeón con índice.
export function LegalPage({ title, version, date, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h1 className="mb-8" style={{ ...legalHeading, fontSize: 'clamp(28px, 5vw, 36px)', lineHeight: 1.2, fontWeight: 700 }}>{title}</h1>
        <div className="text-sm leading-relaxed" style={{ color: '#1D1D1F99' }}>
          <Accordion
            indexTitle="Contenido"
            items={sections}
            intro={
              <div className="mb-5">
                <p><strong style={legalHeading}>Versión {version}</strong>, vigente desde el {date}.</p>
                <div className="mt-1">{intro}</div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

// Tabla simple para las páginas legales.
export function LegalTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr style={legalHeading}>
            {head.map((h) => <th key={h} className="py-2 pr-3 font-semibold" style={{ borderBottom: '1px solid #E4EBFA' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="align-top">
              {row.map((cell, i) => (
                <td key={i} className={`py-2 pr-3 ${i === 0 ? 'font-medium' : ''}`} style={{ borderBottom: '1px solid #E4EBFA', ...(i === 0 ? legalHeading : {}) }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Subtítulo dentro de una sección. Estilo en línea: los estilos globales de h3 pisan las clases.
export function LegalSubheading({ children }: { children: ReactNode }) {
  return <h3 className="mt-4" style={{ ...legalHeading, fontSize: '14px', lineHeight: '20px', fontWeight: 600, fontFamily: 'inherit' }}>{children}</h3>;
}
