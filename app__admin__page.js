import { redirect } from 'next/navigation';
import { getStaff } from '@/lib/auth';
import UI from './ui';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  const me = await getStaff();
  if (!me) redirect('/login');
  return <UI me={{ id: me.id, email: String(me.email || ''), username: String(me.username || (me.owner ? 'admin_rehan' : 'admin')), role: String(me.role || ''), owner: !!me.owner, phone: String(me.phone || '') }} />;
}
