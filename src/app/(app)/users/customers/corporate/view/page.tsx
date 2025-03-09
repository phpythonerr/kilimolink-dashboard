export default async function Page({
  searchParams,
}: Promise<{
  id?: string;
}>) {
  const { id } = await searchParams;

  return <></>;
}
