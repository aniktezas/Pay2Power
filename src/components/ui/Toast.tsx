import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#1e293b' },
        },
        error: {
          iconTheme: { primary: '#f43f5e', secondary: '#1e293b' },
        },
      }}
    />
  );
}
