import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ErrorBoundary caught error in [${(this as any).props?.fallbackName || 'Component'}]:`, error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
  };

  public render() {
    const currentState = (this as any).state as State;
    const currentProps = (this as any).props as Props;

    if (currentState?.hasError) {
      return (
        <div className="p-4 bg-slate-900/90 border border-red-800/80 rounded-xl shadow-xl text-slate-200">
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-semibold">
              {currentProps?.fallbackName || 'Section'} Unavailable
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-mono mb-3">
            An isolated rendering error occurred: {currentState.error?.message || 'Component error'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Recover Component</span>
          </button>
        </div>
      );
    }

    return currentProps?.children || null;
  }
}
