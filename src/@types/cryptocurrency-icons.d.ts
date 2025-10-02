// This file fixes the error: Could not find a declaration file for module '@bitgo-forks/cryptocurrency-icons/react/${iconName}'
declare module '@bitgo-forks/cryptocurrency-icons/react/*' {
  import { FC, SVGProps } from 'react';
  const Icon: FC<Omit<SVGProps<SVGSVGElement>, 'ref'>>;
  export default Icon;
}
