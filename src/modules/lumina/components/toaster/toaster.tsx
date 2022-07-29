import { IToaster, IToastProps, Position as BlueprintPosition, Toaster as BlueprintToaster } from '@blueprintjs/core';
import _ from 'lodash';
import React from 'react';

interface ILuminaToastProps extends IToastProps {
  showAlertBeforeClosingWindow?: boolean;
}

class Toaster {
  private toaster: IToaster;

  public constructor() {
    // initialize to default toaster for the login and sign up screens.
    // the main toaster is in the internal-router.
    this.toaster = BlueprintToaster.create({
      className: 'l-toaster',
      position: BlueprintPosition.BOTTOM_LEFT,
    });
    window.addEventListener('beforeunload', this.handleWindowClose);
  }

  public setToaster = (toaster: IToaster) => {
    // cannot setToaster to null
    if (!toaster) {
      return;
    }
    this.toaster = toaster;
  };

  public show = (props: ILuminaToastProps, key?: string): string => {
    if (!this.toaster) {
      throw new Error('Toaster is not initialized');
    }
    // blueprint does not allow the react component inside message to close the
    // toast, we need to inject a onDismiss to enable this
    if (props.message && React.isValidElement(props.message)) {
      props.message = React.cloneElement(props.message as JSX.Element, {
        ...props.message.props,
        onDismiss: () => this.toaster.dismiss(toastKey),
      });
    }
    const toastKey = this.toaster.show(props, key);
    return toastKey;
  };

  private handleWindowClose = (event: BeforeUnloadEvent) => {
    const toasts = this.toaster.getToasts();
    const showAlert = !!_.find(toasts, {
      showAlertBeforeClosingWindow: true,
    });
    if (showAlert) {
      event.preventDefault();
      return (event.returnValue = 'Are you sure you want to close?');
    }
    return null;
  };
}

export const AppToaster = new Toaster();
