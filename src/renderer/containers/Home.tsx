import { Link } from 'react-router-dom';
import { Title } from '../components';
import { Selectfield } from '../elements';
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
          Disabled
          onChange={event => {
            setBitGoEnvironment(event.currentTarget.value as 'prod' | 'test');
          }}
        >
          {data!.map(value => (
            <option key={value}>{value}</option>
          ))}
        </Selectfield>
      )}
      <Link to="/non-bitgo-recovery">Non-BitGo Recovery</Link>
      <Link to="/build-unsigned-sweep">Build Unsigned Sweep</Link>
    </>
  );
}
