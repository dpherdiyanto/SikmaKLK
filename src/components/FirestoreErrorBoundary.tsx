import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FirestoreErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class FirestoreErrorBoundary extends React.Component<
  { children: React.ReactNode },
  FirestoreErrorBoundaryState
> {
  declare props: { children: React.ReactNode };
  declare state: FirestoreErrorBoundaryState;
  declare setState: (state: Partial<FirestoreErrorBoundaryState>) => void;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): FirestoreErrorBoundaryState {
    let readable = 'Terjadi gangguan sinkronisasi data dengan server.';
    if (error?.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed && parsed.error) {
          if (String(parsed.error).includes('Quota exceeded')) {
            readable = 'Kuota harian gratis Firebase Firestore telah tercapai dan akan reset besok.';
          } else if (String(parsed.error).includes('permission') || String(parsed.error).includes('insufficient')) {
            readable = 'Akses data ditolak oleh aturan keamanan Firestore. Pastikan Anda login dengan akun terverifikasi.';
          } else {
            readable = String(parsed.error);
          }
        }
      } catch {
        readable = error.message;
      }
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Terjadi Kendala Sistem</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{this.state.message}</p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#002B49] text-white text-xs font-bold hover:bg-[#001D33] transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
