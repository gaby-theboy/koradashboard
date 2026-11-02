import { useCallback, useEffect, useRef, useState } from 'react'
import { getPayments } from '../services/payments'

export function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const cacheRef = useRef(null)

  const loadPayments = useCallback(async () => {
    if (cacheRef.current) {
      setPayments(cacheRef.current)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await getPayments()
      const payload = response?.data
      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.payments)
            ? payload.payments
            : Array.isArray(payload?.items)
              ? payload.items
              : []
      cacheRef.current = data
      setPayments(data)
    } catch (err) {
      setError('Unable to load payment analytics right now. Please retry in a moment.')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  return { payments, loading, error, refetch: loadPayments }
}
