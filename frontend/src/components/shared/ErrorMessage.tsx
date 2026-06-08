interface ErrorMessageProps {
  message: string
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
  <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
    {message}
  </div>
)
