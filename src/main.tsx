import '@/shared/styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AppProviders } from '@/app/providers';
import { createQueryClient } from '@/app/query-client';
import { createAppRouter } from '@/app/router';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

const queryClient = createQueryClient();
const router = createAppRouter();

createRoot(root).render(
  <StrictMode>
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
