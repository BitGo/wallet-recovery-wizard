import { NetworkType } from '@bitgo/statics';
import { Collapse } from '@blueprintjs/core';
import { EnvironmentName } from 'bitgo';
import cn from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { useApplicationContext } from '../../components/contexts/application-context';
import LogInButton from '../../components/log-in-button/log-in-button';
import { GridColumn } from '../../modules/lumina/components/grid-column/grid-column';
import { GridRow } from '../../modules/lumina/components/grid-row/grid-row';
import { H4 } from '../../modules/lumina/components/H4/h4';
import { H5 } from '../../modules/lumina/components/H5/h5';
import { H6 } from '../../modules/lumina/components/H6/h6';
import { HelpBlock } from '../../modules/lumina/components/help-block/help-block';
import { HoverArrow } from '../../modules/lumina/components/hover-arrow/hover-arrow';
import { HtmlSelect } from '../../modules/lumina/components/html-select/html-select';
import { Label } from '../../modules/lumina/components/label/label';
import Logo from '../../modules/lumina/components/logo/logo';
import { BitgoSDKOfflineWrapper } from '../../pkg/bitgo/bitgo-sdk-offline-wrapper';
import messages from './messages';
import './_home-page.scss';

const { version } = require('/package.json');

const isDevelopment = process.env.IS_DEVELOPMENT === 'true';

function HomePage() {
  const { locale, setLocale, network, setNetwork, setBitgoSDKOfflineWrapper, session } = useApplicationContext();

  return (
    <div className="flex flex-grow-1 items-center justify-center pv4 l-gpl l-gpr" data-testid="home-page">
      <div className="mw8 w-100">
        <Logo />

        <H4 className="mt3" mbx="mb1">
          BitGo Wallet Recovery Wizard
        </H4>
        <Label className="silver" size="s" mbx="mb3">
          Version: {version} {isDevelopment && ' · Dev Build'}
        </Label>

        <GridRow nmhx="nmh4">
          <GridColumn className="w-third-l" phx="ph4">
            <div className="lh-copy mb3">
              <FormattedMessage
                defaultMessage="This tool is built for assisting customers with recovering coins from BitGo wallets."
                {...messages.appDescription}
              />
            </div>

            <div className="mb3">
              <Label>Environment</Label>
              <HtmlSelect
                onChange={(event) => {
                  const networkValue = event.target.value as NetworkType;
                  const envName: EnvironmentName = networkValue === NetworkType.MAINNET ? 'prod' : 'test';
                  const bitgoInstance = new BitgoSDKOfflineWrapper({
                    env: envName,
                  });
                  setNetwork(networkValue);
                  setBitgoSDKOfflineWrapper(bitgoInstance);
                }}
                value={network}
                options={[
                  {
                    label: 'Testnet',
                    value: NetworkType.TESTNET,
                  },
                  {
                    label: 'Mainnet',
                    value: NetworkType.MAINNET,
                  },
                ]}
              />
            </div>

            {/* TODO(louis): Comment out language selector until all copy finalized */}
            <Label>Language</Label>
            <HtmlSelect
              className="mb4"
              onChange={(event) => {
                setLocale(event.target.value);
              }}
              value={locale}
              options={[
                {
                  label: 'English',
                  value: 'en',
                },
                {
                  label: '日本語',
                  value: 'ja',
                },
              ]}
            />
          </GridColumn>

          <GridColumn className="w-two-thirds-l" phx="ph4">
            <div className="mb4">
              <H5>Available Offline</H5>
              <NavLink
                className="db bg-white bg-almost-white-hover pointer no-underline ba b--border br2 mb3 pa3"
                to="/non-bitgo-recoveries"
                data-testid="non-bitgo-recoveries"
              >
                <H6>
                  Non-BitGo Recovery
                  <HoverArrow />
                </H6>
                <HelpBlock>Recover wallets using the user and backup key (sign a transaction without BitGo).</HelpBlock>
              </NavLink>

              <NavLink
                className="db bg-white bg-almost-white-hover pointer no-underline ba b--border br2 mb3 pa3"
                to="/build-unsigned-sweep"
                data-testid="build-unsigned-sweep"
              >
                <H6>
                  Build Unsigned Sweep
                  <HoverArrow />
                </H6>
                <HelpBlock>Build an unsigned transaction to sweep a wallet without using BitGo.</HelpBlock>
              </NavLink>
            </div>

            <div className="mb4">
              <H5>Requires BitGo Credentials</H5>
              <Collapse isOpen={!session}>
                <div className="pb3">
                  <div className="flex-l items-center justify-center pa3 bg-almost-white ba br2 b--border">
                    <HelpBlock className="mr3 mb2 mb0-l">
                      Options below require internet connectivity and a BitGo account. Please log in to enable the
                      options below.
                    </HelpBlock>
                    <LogInButton buttonProps={{ className: 'flex-shrink-0' }} />
                  </div>
                </div>
              </Collapse>
              <NavLink
                className={cn('db no-underline ba b--border br2 mb3 pa3', {
                  'link-disabled': !session,
                  'bg-white bg-almost-white-hover pointer': session,
                })}
                to="/wrong-chain-recoveries"
                data-testid="wrong-chain-recoveries"
              >
                <H6
                  className={cn({
                    'o-50': !session,
                  })}
                >
                  Wrong Chain Recoveries
                  <HoverArrow />
                </H6>
                <HelpBlock>Recover funds sent to the wrong chain, such as BTC sent to an LTC address.</HelpBlock>
              </NavLink>

              <NavLink
                className={cn('db no-underline ba b--border br2 mb3 pa3', {
                  'link-disabled': !session,
                  'bg-white bg-almost-white-hover pointer': session,
                })}
                to="/unsupported-tokens-recoveries"
                data-testid="unsupported-tokens-recoveries"
              >
                <H6
                  className={cn({
                    'o-50': !session,
                  })}
                >
                  Unsupported Token Recoveries
                  <HoverArrow />
                </H6>
                <HelpBlock>Recover ERC20 tokens that are not officially supported by BitGo.</HelpBlock>
              </NavLink>

              <NavLink
                className={cn('db no-underline ba b--border br2 mb3 pa3', {
                  'link-disabled': !session,
                  'bg-white bg-almost-white-hover pointer': session,
                })}
                to="/migrated-legacy-wallet-recoveries"
                data-testid="migrated-legacy-wallet-recoveries"
              >
                <H6
                  className={cn({
                    'o-50': !session,
                  })}
                >
                  Migrated Legacy Wallet Recoveries
                  <HoverArrow />
                </H6>
                <HelpBlock>Recover unsupported migrated BCH, BSV, and BTG wallets.</HelpBlock>
              </NavLink>
            </div>
          </GridColumn>
        </GridRow>
      </div>
    </div>
  );
}

export default HomePage;
