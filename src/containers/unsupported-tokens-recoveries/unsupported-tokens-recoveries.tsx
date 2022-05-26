import { Icon } from '@blueprintjs/core';
import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useApplicationContext } from '../../components/contexts/application-context';
import UnsupportedTokensRecoveriesForm from '../../components/unsupported-tokens-recoveries-form/unsupported-tokens-recoveries-form';
import { H4 } from '../../modules/lumina/components/H4/h4';

function UnsupportedTokensRecoveries() {
  const { session } = useApplicationContext();
  const history = useHistory();
  if (!session) {
    history.push('/');
  }
  return (
    <div className="flex flex-column flex-grow-1 overflow-auto">
      <div className="flex items-center w-100 l-gpl l-gpr pv3 bb b--border">
        <H4 mbx="" className="truncate flex-grow-1">
          Unsupported Token Recoveries
        </H4>

        <NavLink className="fw5 l-appSideNavigation-link bp3-button bp3-minimal bp3-button--square" to="/">
          <Icon icon="cross" />
        </NavLink>
      </div>
      <UnsupportedTokensRecoveriesForm />
    </div>
  );
}

export default UnsupportedTokensRecoveries;
