import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let friendly = 'Something went wrong while loading this section.';
      if (this.state.errorMessage.includes('Missing or insufficient permissions')) {
        friendly =
          'Access to this record requires authorized HM Mobile admin permissions.';
      } else if (this.state.errorMessage.includes('Quota exceeded')) {
        friendly =
          'Daily database read quota was reached. Please check again later or review Firebase usage.';
      }

      return (
        <div className="min-h-[320px] flex items-center justify-center p-6 bg-[#FAFAFA] dark:bg-[#0B0F17]">
          <div className="max-w-md w-full bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-4">
            <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Unable to display view
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{friendly}</p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
