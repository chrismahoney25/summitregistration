import { Suspense } from 'react'
import { RegistrationForm } from '@/components/registration/registration-form'

export default function Home() {
  return (
    <main className="min-h-screen py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<FormSkeleton />}>
          <RegistrationForm />
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
