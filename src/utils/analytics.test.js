import test from 'node:test'
import assert from 'node:assert/strict'
import { makeBreakdownSeries } from './analytics.js'

test('groups basic plan variants together in plan revenue breakdown', () => {
  const payments = [
    { planName: 'Basic Plan', amount: 100 },
    { planName: 'basic', amount: 50 },
    { planName: 'Classic Plan', amount: 75 },
  ]

  const result = makeBreakdownSeries(payments, 'planName', (payment) => Number(payment.amount || 0))

  assert.deepEqual(result, {
    'Basic Plan': 150,
    'Classic Plan': 75,
  })
})
