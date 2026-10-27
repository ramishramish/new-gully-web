import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export const NotFound: React.FC = () => {
  return (
    <PageTransition>
      <div className="bg-vintage-cream min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center bg-vintage-ivory/80 p-8 md:p-12 rounded border border-vintage-border shadow-vintage">
          <Compass className="w-16 h-16 text-vintage-gold mx-auto mb-4 stroke-1 animate-spin-slow" />
          <span className="text-xs font-bold uppercase tracking-widest text-vintage-burgundy block mb-1">
            404 — PAGE NOT FOUND
          </span>
          <h1 className="font-serif font-bold text-3xl text-vintage-brown mb-3">
            Out of Fashion Realm
          </h1>
          <p className="text-xs text-vintage-muted leading-relaxed mb-8">
            The page or collection you are seeking might have been renamed or no longer exists. 
            Let us guide you back to our curated departments.
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="btn-vintage-primary w-full py-3 text-xs flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO HOME</span>
            </Link>

            <div className="flex gap-2">
              <Link
                to="/mens"
                className="flex-1 btn-vintage-secondary py-2.5 text-xs text-center"
              >
                Men's Styles
              </Link>
              <Link
                to="/kids"
                className="flex-1 btn-vintage-secondary py-2.5 text-xs text-center"
              >
                Kids' Styles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
