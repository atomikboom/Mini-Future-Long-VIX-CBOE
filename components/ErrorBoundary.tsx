import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // telemetry minimale: log per debugging client-side
    console.error("[UI ErrorBoundary]", error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <div className="error-fallback">
            <h1>Errore nell&apos;interfaccia</h1>
            <p>Ricarica la pagina. Se il problema persiste, controlla la console del browser.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
