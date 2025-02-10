import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="flex relative items-center w-full">
        <div className="w-[72rem] m-auto">
          <Navlinks />
        </div>
      </div>
    </nav>
  );
}
