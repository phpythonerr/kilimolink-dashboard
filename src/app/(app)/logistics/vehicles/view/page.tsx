interface SearchParams extends Record<string, string | string[] | undefined> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  const queryParams = await searchParams;
  return <></>;
}
