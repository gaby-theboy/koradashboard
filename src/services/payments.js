import axios from 'axios'

export async function getPayments() {
  return axios.post('https://dataapis.wixsite.com/kora/_functions/Payments/', {}, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
