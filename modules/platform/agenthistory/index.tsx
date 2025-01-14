import { createClient } from '@/shared/utils/supabase/server';
import AgentsDashboard from '@/shared/components/agent-history';

export default async function AgentHistoryDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="w-full mb-32">
        <AgentsDashboard user={user} />
    </section>
  );
}
