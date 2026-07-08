import { authClient } from '@/lib/auth-client';
async function test() {
  const accounts = await authClient.listAccounts();
  const res = await authClient.linkSocial({ provider: 'google' });
}
