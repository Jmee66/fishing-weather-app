interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string }
export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : size === 'lg' ? 'w-12 h-12 border-4' : 'w-8 h-8 border-4'
  return <div className={`${s} border-blue-600 border-t-transparent rounded-full animate-spin ${className}`} />
}