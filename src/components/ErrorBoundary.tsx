import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertTriangle className="w-16 h-16 mx-auto text-warning" />
            <h1 className="text-xl font-bold">Qualcosa è andato storto</h1>
            <p className="text-sm text-muted-foreground">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/50 font-mono bg-muted p-2 rounded-lg overflow-auto max-h-24">
                {this.state.error.message}
              </p>
            )}
            <Button onClick={this.handleReload} className="mt-4">
              Ricarica pagina
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
