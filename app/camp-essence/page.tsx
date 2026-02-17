import { Suspense } from 'react'
import { CampRegistrationForm } from '@/components/camp-registration/camp-registration-form'

export default function CampEssencePage() {
  return (
    <main className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<FormSkeleton />}>
          <CampRegistrationForm />
        </Suspense>
      </div>
    </main>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-zinc-200 rounded-2xl" />
      <div className="h-64 bg-zinc-200 rounded-2xl" />
      <div className="h-48 bg-zinc-200 rounded-2xl" />
    </div>
  )
}
