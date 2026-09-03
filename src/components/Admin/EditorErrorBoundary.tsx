'use client';

import React, { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
};

type State = { error: Error | null };

/**
 * Empêche un crash Quill / React d'afficher "Application error" sur toute la page.
 */
export default class EditorErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('EditorErrorBoundary:', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Éditeur indisponible pour ce bloc. Rechargez la page ou utilisez le champ texte simple.
        </div>
      );
    }
    return this.props.children;
  }
}
