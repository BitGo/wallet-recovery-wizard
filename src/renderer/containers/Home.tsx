import { Link } from 'react-router-dom';
import { Selectfield, Title } from '../components';
import { LinkCard, LinkCardItem } from '../components/LinkCard';
// import { useElectronQuery, useElectronCommand } from '../hooks';

export default function Home() {
  // const { data, state } = useElectronQuery('getBitGoEnvironments');
  // const [setBitGoEnvironment, { state: setBitGoEnvironmentState }] =
  //   useElectronCommand('setBitGoEnvironment');

  return (
    <>
      <Title>Home</Title>
      <div className="tw-flex tw-items-center tw-container tw-mx-auto tw-px-8 tw-min-h-screen">
        <div>
          <div className="tw-mb-4">
            <img
              width="40"
              height="40"
              src={new URL('../../assets/logo.svg', import.meta.url).toString()}
            />
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
                <Selectfield Label="Environment">
                  <option value="test">Testnet</option>
                  <option value="prod">Prod</option>
                </Selectfield>
                <Selectfield Label="Language" value="en" disabled Disabled>
                  <option value="en">English</option>
                </Selectfield>
              </div>
            </div>
            <div className="md:tw-flex-grow">
              <LinkCard Width="fill" Title="Available Offline">
                <LinkCardItem
                  Tag={Link}
                  to="non-bitgo-recovery/"
                  Title="Non-BitGo Recovery"
                  Description="Recover wallets using the user and backup key (sign a transaction without BitGo)."
                />
                <LinkCardItem
                  Tag={Link}
                  to="/"
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
