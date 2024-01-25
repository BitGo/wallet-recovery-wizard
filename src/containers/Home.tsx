import * as React from 'react';
import { Link } from 'react-router-dom';
import { LinkCard, LinkCardItem, Selectfield, Title } from '~/components';
import { useLocalStorageState } from '~/hooks';
import logo from '/logo.svg';

export function Home() {
  const [env, setEnv] = useLocalStorageState('test', 'env');
  const [includePubsInUnsignedSweep, setIncludePubsInUnsignedSweep] =
    useLocalStorageState(false, 'includePubsInUnsignedSweep');
  const [version, setVersion] = React.useState('...');
  React.useEffect(() => {
    void window.queries.getVersion().then(setVersion);
  }, []);

  return (
    <>
      <Title>BitGo Wallet Recovery Wizard</Title>
      <div className="tw-flex tw-items-center tw-container tw-mx-auto tw-px-8 tw-min-h-screen">
        <div>
          <div className="tw-mb-4">
            <img width="40" height="40" src={logo} />
          </div>
          <h3 className="tw-text-header-3 tw-font-semibold tw-text-slate-900">
            BitGo Wallet Recovery Wizard
          </h3>
          <small className="tw-text-label-1 tw-font-medium tw-text-gray-700">
            Version: {version}
          </small>
          <div className="tw-flex tw-flex-col tw-gap-4 md:tw-flex-row md:tw-gap-16">
            <div className="md:tw-basis-[20.75rem]">
              <p className="tw-text-body tw-text-slate-900  tw-my-2">
                This is a tool is built for assisting customers with recovering
                coins from BitGo wallets.
              </p>
              <div className="tw-flex tw-flex-col tw-gap-2">
                <Selectfield
                  Label="Environment"
                  onChange={event => setEnv(event.currentTarget.value)}
                  value={env}
                  Width="fill"
                >
                  <option value="test">Testnet</option>
                  <option value="prod">Mainnet</option>
                </Selectfield>
                <Selectfield
                  disabled
                  Disabled
                  Label="Language"
                  value="en"
                  Width="fill"
                >
                  <option value="en">English</option>
                </Selectfield>
                <label className="tw-text-label-1">
                  <input
                    className="tw-accent-blue-500 tw-align-middle"
                    type="checkbox"
                    checked={includePubsInUnsignedSweep}
                    onChange={event => {
                      setIncludePubsInUnsignedSweep(
                        event.currentTarget.checked
                      );
                    }}
                  />
                  &nbsp; Include pubs in Unsigned Sweep transactions
                </label>
              </div>
            </div>
            <div className="md:tw-flex-grow">
              <LinkCard Width="fill" Title="Available Offline">
                <LinkCardItem
                  Tag={Link}
                  to={`/${env}/non-bitgo-recovery`}
                  Title="Non-BitGo Recovery"
                  Description="Recover wallets using the user and backup key (sign a transaction without BitGo)."
                />
                <LinkCardItem
                  Tag={Link}
                  to={`/${env}/build-unsigned-sweep`}
                  Title="Build Unsigned Sweep"
                  Description="Build an unsigned transaction to sweep a wallet without using BitGo."
                />
                <LinkCardItem
                  Tag={Link}
                  to={`/${env}/evm-cross-chain-recovery`}
                  Title="Evm Cross Chain Recovery"
                  Description="Recover wallet funds sent to wrong chain(evm compatible) for hot/cold/custody wallets."
                />
                <LinkCardItem
                  Tag={Link}
                  Title="Build Unsigned Consolidation"
                  Description="Build an unsigned transaction to consolidate a wallet without using BitGo."
                  to={`/${env}/build-unsigned-consolidation`}
                />
                <LinkCardItem
                  Tag={Link}
                  Title="Create Broadcastable MPC Transaction"
                  Description="Build a broadcastable MPC transaction without using BitGo."
                  to={`/${env}/create-broadcastable-transaction`}
                />
                <LinkCardItem
                  Tag={Link}
                  Title="Broadcast Transaction"
                  Description="Broadcast a signed transaction to the blockchain, without BitGo."
                  to={`/${env}/broadcast-transaction`}
                />
              </LinkCard>
            </div>
            <div className="md:tw-flex-grow">
              <LinkCard Width="fill" Title="Available Online">
                <LinkCardItem
                  Tag={Link}
                  to={`/${env}/wrong-chain-recovery`}
                  Title="Wrong Chain Recoveries"
                  Description="Recover funds sent to the wrong chain, such as BTC sent to a LTC address."
                />
              </LinkCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
