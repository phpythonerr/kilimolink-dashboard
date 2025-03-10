interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: any) {
  const queryParams = await searchParams;
  return <></>;
}
