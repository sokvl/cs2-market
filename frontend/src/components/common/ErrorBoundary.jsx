import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
    this.setState({ error, info });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:'2rem', color:'#fff'}}>
          <h2>Coś poszło nie tak.</h2>
          <p>Komponent zgłosił błąd i został przechwycony.</p>
          {this.state.error && (
            <pre style={{whiteSpace:'pre-wrap', background:'rgba(255,255,255,0.1)', padding:'1rem', borderRadius:'8px'}}>
{String(this.state.error.message || this.state.error)}
            </pre>
          )}
          <button onClick={this.handleRetry} style={{marginTop:'1rem'}}>Spróbuj ponownie</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
