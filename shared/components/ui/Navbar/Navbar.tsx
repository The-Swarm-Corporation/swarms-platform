import { createClient } from '@/shared/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-full mx-auto pl-32 pr-32 dark:bg-[#0f172a] bg-cyan-700">
        <Navlinks user={user} />
      </div>
    </nav>
  );
}
