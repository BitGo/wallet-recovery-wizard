/* eslint-disable class-methods-use-this */
import * as BitgoJS from 'bitgo';
import { BitGo, BitGoOptions } from 'bitgo';
import _ from 'lodash';
import { BitgoInstrument } from '../../modules/lumina/api/bitgo-instruments';
import { AppToaster } from '../../modules/lumina/components/toaster/toaster';

export interface BitgoError {
  status: number;
  result?: any;
  invalidToken?: boolean;
  needsOTP?: boolean;
  message: string;
}

export class BitgoSDKOfflineWrapper {
  public bitgoSDK: BitGo;

  constructor(options: BitGoOptions) {
    this.bitgoSDK = new BitgoJS.BitGo(options);
  }

  public getBitgoInstrument(instrumentSymbol?: string): BitgoInstrument | undefined {
    if (_.isEmpty(instrumentSymbol)) {
      return undefined;
    }
    try {
      const formattedInstrumentSymbol = instrumentSymbol.toLowerCase();
      const bitgoBaseCoin = this.bitgoSDK.coin(formattedInstrumentSymbol);
      if (!bitgoBaseCoin) {
        return undefined;
      }
      return new BitgoInstrument(formattedInstrumentSymbol, bitgoBaseCoin);
    } catch (_e) {
      // for some SDK updates may get CoinNotDefinedErrors
      return undefined;
    }
  }

  public async endUserSession(onLogOutComplete: () => void = () => null) {
    try {
      const session = await this.bitgoSDK.session();
      window.sessionStorage.clear();
      // Logout invalidates the access token and so we don't want to invalidate
      // the user's access token if they used that to auth. The only way to tell
      // if the access token was used for authenticating is to check if there's a
      // label on the session. If no label is present then the user used
      // credentials to log in.
      if (!session.label) {
        await this.bitgoSDK.logout();
      }
      AppToaster.show({
        message: "You've been logged out.",
      });
      onLogOutComplete();
    } catch (e) {
      console.error('Error logging out', e);
    }
  }
}
