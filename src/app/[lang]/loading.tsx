
import { Loader } from 'lucide-react';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
