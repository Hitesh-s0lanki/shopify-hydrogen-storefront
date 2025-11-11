import PageLayout from "./_components/page-layout";

type Props = {
  children: React.ReactNode;
};

const PublicLayout = async ({ children }: Props) => {
  return <PageLayout>{children}</PageLayout>;
};

export default PublicLayout;
