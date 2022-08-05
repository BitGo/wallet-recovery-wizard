import React from 'react';
import { Title } from '../components';

type State<TData> =
  | { data: undefined; state: 'idle'; error: undefined }
  | { data: undefined; state: 'loading'; error: undefined }
  | { data: TData; state: 'success'; error: undefined }
  | { data: undefined; state: 'failure'; error: unknown };

type Action<TData> =
  | { type: 'fetch' }
  | { type: 'resolve'; payload: TData }
  | { type: 'reject'; payload: unknown };

const asyncDataReducer = <TData,>(
  state: State<TData>,
  action: Action<TData>
): State<TData> => {
  switch (action.type) {
    case 'fetch':
      return {
        data: undefined,
        error: undefined,
        state: 'loading',
      };
    case 'resolve':
      return {
        data: action.payload,
        error: undefined,
        state: 'success',
      };
    case 'reject':
      return {
        data: undefined,
        error: action.payload,
        state: 'failure',
      };
    default:
      return state;
  }
};

const useElectronQuery = (query: keyof Window['queries']) => {
  const reducer: (
    state: State<Awaited<ReturnType<Window['queries'][typeof query]>>>,
    action: Action<Awaited<ReturnType<Window['queries'][typeof query]>>>
  ) => State<Awaited<ReturnType<Window['queries'][typeof query]>>> =
    asyncDataReducer;
  const [state, dispatch] = React.useReducer(reducer, {
    data: undefined,
    error: undefined,
    state: 'idle',
  });
  React.useEffect(() => {
    dispatch({ type: 'fetch' });
    window.queries[query]()
      .then(data => {
        dispatch({ type: 'resolve', payload: data });
      })
      .catch(error => {
        dispatch({ type: 'reject', payload: error });
      });
  }, [query]);

  return state;
};

export default function Home() {
  const { data, state } = useElectronQuery('getBitGoEnvironments');

  return (
    <>
      <Title>Home</Title>
      <h1>Hello!</h1>
      <p>{state}</p>
      {state === 'success' && (
        <select>
          {(data ?? []).map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
      )}
    </>
  );
}
