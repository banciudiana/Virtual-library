import { createClient } from 'next-sanity'

export const adminClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-01-01',
  useCdn: false, // Obligatoriu false pentru scriere
  token: process.env.NEXT_PUBLIC_SANITY_API_WRITE_TOKEN,
})