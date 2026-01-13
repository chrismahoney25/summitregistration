import useSWR from 'swr'
import { Summit } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface SummitsResponse {
  summits: Summit[]
}

export function useSummits() {
  const { data, error, isLoading } = useSWR<SummitsResponse>(
    '/api/summits',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  )

  return {
    summits: data?.summits ?? [],
    isLoading,
    error,
  }
}
