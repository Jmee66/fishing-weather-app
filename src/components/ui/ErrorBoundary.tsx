import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 bg-red-50 rounded-xl text-red-700 text-sm">
          <p className="font-semibold">Une erreur est survenue</p>
          <p className="text-xs mt-1">{this.state.error?.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}