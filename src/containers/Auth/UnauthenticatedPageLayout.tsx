import { Outlet } from 'react-router-dom';
import { PageLayout, PageLayoutProps } from '~/components';

export function UnauthenticatedPageLayout({
  Title,
  Description,
}: PageLayoutProps) {
  return (
    <PageLayout Title={Title} Description={Description}>
      <Outlet />
    </PageLayout>
  );
}
