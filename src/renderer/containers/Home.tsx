import { Selectfield, Title } from '../components';
import { useElectronQuery, useElectronCommand } from '../hooks';

export default function Home() {
  const { data, state } = useElectronQuery('getBitGoEnvironments');
  const [setBitGoEnvironment, { state: setBitGoEnvironmentState }] =
    useElectronCommand('setBitGoEnvironment');

  return (
    <>
      <Title>Home</Title>
      <h1>Hello!</h1>
      <p>{state}</p>
      <p>{setBitGoEnvironmentState}</p>
      {state === 'success' && (
        <Selectfield
          Label="BitGo Environment"
          onChange={event => {
            setBitGoEnvironment(event.currentTarget.value as 'prod' | 'test');
          }}
        >
          {data.map(value => (
            <option key={value}>{value}</option>
          ))}
        </Selectfield>
      )}
    </>
  );
}
