import { PageContainer } from './page-container';

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <PageContainer className="flex min-h-16 items-center">
        <p className="text-xs text-muted-foreground">
          Apartment listings across Egypt. Prices shown in EGP.
        </p>
      </PageContainer>
    </footer>
  );
}
