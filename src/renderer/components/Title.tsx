import React from 'react';
import * as ReactDOMServer from 'react-dom/server';

export function Title({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  window.ipc.setTitle(
    ReactDOMServer.renderToStaticMarkup(children as React.ReactElement)
  );

  return null;
}
