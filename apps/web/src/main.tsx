import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { router } from './router'
import './styles/global.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebPersistenceProvider>
      <RouterProvider router={router} />
    </WebPersistenceProvider>
  </StrictMode>,
)
