import React from 'react';
import { Collapse } from '@blueprintjs/core';

import { useSession } from '../../contexts/session';
import { useBitGoEnvironment } from '../../contexts/bitgo-environment';
import { IBaseProps } from '../../modules/lumina/components/base-props';
import { AppToaster } from '../../modules/lumina/components/toaster/toaster';
import LogInButton from '../log-in-button/log-in-button';

export function AppContainer({ children }: IBaseProps) {
  const { session, user, endSession } = useSession();
  const { environment } = useBitGoEnvironment();

  const clearUserSession = async () => {
    try {
      await endSession();
      AppToaster.show({
        message: 'Your session expired. Please log in again.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (session?.expires) {
    const sessionExpiration = new Date(session?.expires);
    if (sessionExpiration < new Date()) {
      clearUserSession();
    }
  }
  return (
    <div className="flex flex-grow-1 flex-column overflow-auto">
      <Collapse isOpen={!!session}>
        <div className="l-gpl l-gpr pv2 bb b--border silver bg-almost-white l-logged-in-banner">
          <div className="mw8 center w-100 fw5 f7 tc">
            Logged in as <span className="grey-900">{user?.username}</span> on{' '}
            {`bitgo${environment === 'test' ? '-test' : ''}.com`} &middot;{' '}
            <LogInButton buttonProps={{ className: 'pointer blue' }} />
          </div>
        </div>
      </Collapse>
      <div className="flex flex-column flex-grow-1 flex-shrink-1 relative overflow-auto">{children}</div>
    </div>
  );
}
