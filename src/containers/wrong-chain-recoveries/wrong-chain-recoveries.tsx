import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';

import { Icon } from '@blueprintjs/core';

import WrongChainRecoveriesForm from '../../components/wrong-chain-recoveries-form/wrong-chain-recoveries-form';
import { useSession } from '../../contexts/session';
import { H4 } from '../../modules/lumina/components/H4/h4';

function WrongChainRecoveriesPage() {
  const { session } = useSession();
  const history = useHistory();
  if (!session) {
    history.push('/');
  }
  return (
    <div className="flex flex-column flex-grow-1 overflow-auto">
      <div className="flex items-center w-100 l-gpl l-gpr pv3 bb b--border">
        <H4 mbx="" className="truncate flex-grow-1">
          Wrong Chain Recoveries
        </H4>

        <NavLink className="fw5 l-appSideNavigation-link bp3-button bp3-minimal bp3-button--square" to="/">
          <Icon icon="cross" />
        </NavLink>
      </div>
      <WrongChainRecoveriesForm />
    </div>
  );
}

export default WrongChainRecoveriesPage;
