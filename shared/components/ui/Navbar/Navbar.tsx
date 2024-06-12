import { createClient } from '@/shared/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';
import NavbarSearch from '../../panel-layout/components/navbar/components/search';

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
      <div className="max-w-6xl mx-auto flex items-center">
        {user && <NavbarSearch />}
        <Navlinks user={user} />
      </div>
    </nav>
  );
}
