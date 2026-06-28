import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/ko'
dayjs.extend(utc)
import { router } from '@/router'
import { queryClient } from '@/lib/queryClient'
import { PwaUpdatePrompt } from '@/components/common/PwaUpdatePrompt'
import '@/styles/globals.css'

dayjs.locale('ko')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <PwaUpdatePrompt />
    </QueryClientProvider>
  </StrictMode>,
)
