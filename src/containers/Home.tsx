import * as React from 'react';
import { Link } from 'react-router-dom';
import { LinkCard, LinkCardItem, Selectfield, Title } from '~/components';
import logo from '/logo.svg';

export default function Home() {
  const [env, setEnv] = React.useState('test');

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
            Version: 4.0.0 - Dev Build
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
              </LinkCard>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
