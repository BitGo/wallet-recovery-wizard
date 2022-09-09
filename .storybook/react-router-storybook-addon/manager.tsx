import * as React from 'react';
import { addons, types } from '@storybook/addons';
import { useChannel } from '@storybook/api';
import * as constants from './constants';
import {
  AddonPanel,
  TabsState,
  SyntaxHighlighter,
} from '@storybook/components';

const MyPanel = () => {
  const [params, setParams] = React.useState({});
  const [location, setLocation] = React.useState({});
  const [searchParams, setSearchParams] = React.useState({});
  useChannel({
    [constants.EVENTS.PARAMS_CHANGE]: setParams,
    [constants.EVENTS.LOCATION_CHANGE]: setLocation,
    [constants.EVENTS.SEARCH_PARAMS_CHANGE]: setSearchParams,
  });
  return (
    <TabsState initial="storybook-addon-react-router-params">
      <div id="storybook-addon-react-router-params" title="Params">
        <SyntaxHighlighter language="json">
          {JSON.stringify(params, null, 2)}
        </SyntaxHighlighter>
      </div>
      <div id="storybook-addon-react-router-location" title="Location">
        <SyntaxHighlighter language="json">
          {JSON.stringify(location, null, 2)}
        </SyntaxHighlighter>
      </div>
      <div
        id="storybook-addon-react-router-search-params"
        title="Search Params"
      >
        <SyntaxHighlighter language="json">
          {JSON.stringify(searchParams, null, 2)}
        </SyntaxHighlighter>
      </div>
    </TabsState>
  );
};

addons.register(constants.ADDON_ID, api =>
  addons.add(constants.PANEL_ID, {
    title: 'React Router',
    type: types.PANEL,
    match: () => true,
    render: ({ active, key }) => (
      <AddonPanel active={!!active} key={key}>
        <MyPanel />
      </AddonPanel>
    ),
  })
);
export {};
