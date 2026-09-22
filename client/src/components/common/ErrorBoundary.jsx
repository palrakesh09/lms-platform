import { Component } from 'react';
import { secondaryButton } from './buttonClasses.js';
import ErrorState from './ErrorState.jsx';

// Catches rendering errors so a bug shows a message instead of a blank page.
// Changing `resetKey` (for example the current path) clears the error, so navigating away recovers.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ErrorState
        title="Something went wrong"
        message="This part of the page failed to display. You can try again, or reload the page."
        onRetry={this.reset}
      >
        <button type="button" onClick={() => window.location.reload()} className={secondaryButton}>
          Reload page
        </button>
      </ErrorState>
    );
  }
}