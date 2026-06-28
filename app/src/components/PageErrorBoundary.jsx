import React from 'react';

class PageErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("PageErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
            return (
                <div className="min-h-[50vh] flex items-center justify-center p-6 bg-sand-50">
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-8 max-w-md w-full shadow-lg text-center space-y-6">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif font-black text-charcoal-900">This page failed to load</h2>
                            <p className="text-sm text-charcoal-500">Something went wrong while opening this section.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-2.5 bg-sage-800 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-sage-900 transition-colors"
                            >
                                Reload
                            </button>
                            <a
                                href="#/"
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                className="px-6 py-2.5 bg-sand-100 text-charcoal hover:bg-sand-200 rounded-xl text-sm font-bold transition-all text-center"
                            >
                                Go Home
                            </a>
                        </div>
                        {isDev && this.state.error && (
                            <details className="text-left bg-red-50 p-4 rounded-xl border border-red-100 text-xs font-mono overflow-auto max-h-40">
                                <summary className="cursor-pointer font-bold text-red-700 select-none">Error Details</summary>
                                <p className="mt-2 text-red-800 font-semibold">{this.state.error.toString()}</p>
                                <pre className="mt-1 text-red-600/80 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default PageErrorBoundary;
