
'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <h2 className="text-2xl font-bold mb-4">Ceva nu a funcționat corect.</h2>
      <p className="text-muted-foreground mb-8">A apărut o eroare la încărcarea portofoliului. Vă rugăm să încercați din nou.</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Încearcă din nou
      </Button>
    </div>
  )
}
