import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface LegalSection {
  heading: string;
  body?: string;
  items?: string[];
}

interface LegalLayoutProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalLayout({ eyebrow, title, updated, intro, sections }: LegalLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span>{title}</span>
      </nav>

      <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">{eyebrow}</span>
      <h1 className="text-3xl font-bold gradient-text mt-2 mb-2">{title}</h1>
      <p className="text-xs text-gray-500 mb-8">Last updated: {updated}</p>

      <p className="text-gray-400 leading-relaxed mb-10">{intro}</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-white mb-3">{section.heading}</h2>
            {section.body && <p className="text-gray-400 leading-relaxed mb-3">{section.body}</p>}
            {section.items && (
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-gray-400 leading-relaxed">
                    <span className="text-primary-400 mt-1.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}