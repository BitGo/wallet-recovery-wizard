import * as React from 'react';
import {
  MemoryRouter,
  useLocation,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { addons } from '@storybook/addons';
import * as constants from './constants';

const DefaultRouteComponent = ({ children }: { children: React.ReactNode }) =>
  children;

const Wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const params = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const channel = addons.getChannel();
  React.useEffect(() => {
    channel.emit(constants.EVENTS.PARAMS_CHANGE, params);
  }, [params]);
  React.useEffect(() => {
    channel.emit(constants.EVENTS.LOCATION_CHANGE, location);
  }, [location]);
  React.useEffect(() => {
    channel.emit(
      constants.EVENTS.SEARCH_PARAMS_CHANGE,
      Object.fromEntries(searchParams)
    );
  }, [searchParams]);

  return children as JSX.Element;
};

export function withRouter(Story: React.FC<any>, context: any) {
  const RouteComponent =
    context.parameters.reactRouter?.RouteComponent ?? DefaultRouteComponent;
  return (
    <MemoryRouter
      initialEntries={context.parameters.reactRouter?.initialEntries}
      initialIndex={context.parameters.reactRouter?.initialIndex}
      basename={context.parameters.reactRouter?.basename}
    >
      <RouteComponent>
        <Wrapper>
          <Story {...context} />
        </Wrapper>
      </RouteComponent>
    </MemoryRouter>
  );
}
