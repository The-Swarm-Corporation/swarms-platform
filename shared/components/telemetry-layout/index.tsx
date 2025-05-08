'use client';

import React, { ReactNode, useState } from 'react';
import { useAPIKeyContext } from '../ui/apikey.provider';
import { useAuthContext } from '../ui/auth.provider';
import { LayoutLoader, MessageComponent } from './components';

export default function TelemetryLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const { apiKey, isApiKeyLoading } = useAPIKeyContext();

  const [showMessage, setShowMessage] = useState(true);

  const handleCloseMessage = () => setShowMessage(false);

  return (
    <>
      {user && isApiKeyLoading && <LayoutLoader />}
      {showMessage && (
        <>
          {user && !apiKey && !isApiKeyLoading && (
            <MessageComponent handleCloseMessage={handleCloseMessage} />
          )}
        </>
      )}

      {children}
    </>
  );
}
