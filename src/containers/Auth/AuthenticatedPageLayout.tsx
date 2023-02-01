import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLayout, PageLayoutProps } from '~/components';
import { Login } from '~/containers/Login';

export function AuthenticatedPageLayout({
  Title,
  Description,
}: PageLayoutProps) {
  const [username, setUsername] = useState<string | undefined>();
  return (
    <>
      {username ? (
        <PageLayout Title={Title} Description={Description}>
          <Outlet />
        </PageLayout>
      ) : (
        <PageLayout
          Title={'Login'}
          Description={'Login to use this feature of WRW'}
        >
          <Login onSuccess={setUsername} />
        </PageLayout>
      )}
    </>
  );
}
