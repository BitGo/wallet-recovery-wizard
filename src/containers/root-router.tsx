import { Position as BlueprintPosition, Toaster } from "@blueprintjs/core";
import React from "react";
import { NavLink, Redirect, Route, Switch } from "react-router-dom";
import { AppContainer } from "../components/app-container/app-container";
import Lead1 from "../modules/lumina/components/lead1/lead1";
import { AppToaster } from "../modules/lumina/components/toaster/toaster";
import BuildUnsignedSweepPage from "./build-unsigned-sweep/build-unsigned-sweep";
import HomePage from "./home-page/home-page";
import MigratedLegacyWalletRecoveriesPage from "./migrated-legacy-wallet-recoveries/migrated-legacy-wallet-recoveries";
import NonBitgoRecoveriesPage from "./non-bitgo-recoveries/non-bitgo-recoveries";
import UnsupportedTokensRecoveriesPage from "./unsupported-tokens-recoveries/unsupported-tokens-recoveries";
import WrongChainRecoveriesPage from "./wrong-chain-recoveries/wrong-chain-recoveries";

class RootRouter extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="flex overflow-auto flex-grow-1 bg-white" data-reactroot>
        <AppContainer>
          <Switch>
            <Route path="/home" component={HomePage} />
            <Route
              path="/wrong-chain-recoveries"
              component={WrongChainRecoveriesPage}
            />
            <Route
              path="/unsupported-tokens-recoveries"
              component={UnsupportedTokensRecoveriesPage}
            />
            <Route
              path="/non-bitgo-recoveries"
              component={NonBitgoRecoveriesPage}
            />
            <Route
              path="/migrated-legacy-wallet-recoveries"
              component={MigratedLegacyWalletRecoveriesPage}
            />
            <Route
              path="/build-unsigned-sweep"
              component={BuildUnsignedSweepPage}
            />
            <Route exact path="/" component={this.handleRenderRedirectRoute} />

            {/* Note: Must be at the end */}
            <Route
              path="/*"
              render={() => {
                return (
                  <div className="pa5 tc">
                    <Lead1>Page Not Found 404</Lead1>
                    <NavLink className="bp3-button" to="/">
                      Go Home
                    </NavLink>
                  </div>
                );
              }}
            />
          </Switch>
        </AppContainer>

        <Toaster
          className="l-toaster"
          position={BlueprintPosition.BOTTOM_LEFT}
          ref={AppToaster.setToaster}
        />
      </div>
    );
  }

  private handleRenderRedirectRoute = () => {
    return <Redirect to="/home" />;
  };
}

export default RootRouter;
