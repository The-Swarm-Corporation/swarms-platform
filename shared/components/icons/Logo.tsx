import Image from 'next/image';
import Link from 'next/link';

const Logo = ({ ...props }) => (
  <Link href={'/'} className="inline-block">
    <div className="bg-[url(/swarms-dark.svg)] dark:bg-[url(/swarms.svg)] bg-no-repeat object-contain w-[40px] h-[40px]"></div>
  </Link>
);

export default Logo;
