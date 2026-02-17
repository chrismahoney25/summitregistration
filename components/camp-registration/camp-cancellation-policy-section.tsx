'use client'

import { useFormContext } from 'react-hook-form'
import { CampRegistrationFormSchema } from '@/lib/camp-validations'
import { CAMP_ESSENCE_CANCELLATION_COPY } from '@/lib/camp-essence'

export function CampCancellationPolicySection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CampRegistrationFormSchema>()

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 p-5" data-field="cancellationPolicyAccepted">
      <div className="space-y-3 text-sm text-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900">
          {CAMP_ESSENCE_CANCELLATION_COPY.title}
        </h3>
        <p>{CAMP_ESSENCE_CANCELLATION_COPY.intro}</p>
        <ul className="space-y-1 list-disc pl-5">
          {CAMP_ESSENCE_CANCELLATION_COPY.schedule.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>{CAMP_ESSENCE_CANCELLATION_COPY.noExceptions}</p>
        <p className="font-semibold text-zinc-900">
          {CAMP_ESSENCE_CANCELLATION_COPY.requiredAcknowledgmentTitle}
        </p>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-zinc-300 text-brand-teal focus:ring-brand-teal"
          {...register('cancellationPolicyAccepted')}
        />
        <span className="text-sm text-zinc-800">
          {CAMP_ESSENCE_CANCELLATION_COPY.requiredAcknowledgmentLabel}
        </span>
      </label>

      <p className="text-sm text-zinc-600">
        {CAMP_ESSENCE_CANCELLATION_COPY.acknowledgmentBody}
      </p>

      {errors.cancellationPolicyAccepted && (
        <p className="text-brand-orange text-sm">
          {errors.cancellationPolicyAccepted.message}
        </p>
      )}
    </div>
  )
}
