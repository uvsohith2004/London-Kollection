import { serverApi } from "@/api/server";
import ClientPage from "./client-page";

export default async function AdminSettingsTeamPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : "";
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  
  // The serverApi will fetch users server-side with cookies automatically managed
  const initialData = await serverApi.get(`/admin/users?${query.toString()}`).catch(() => []);
  const initialUsers = initialData?.data || initialData?.items || (Array.isArray(initialData) ? initialData : []);

  return <ClientPage initialUsers={initialUsers} />;
}
