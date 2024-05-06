import Image from 'next/image';
import Link from 'next/link';

const Logo = ({ ...props }: { width?: number; height?: number }) => (
  <Link href={'/'} className="inline-block">
    {/* <div className="bg-[url(/swarms-logo.svg)] bg-no-repeat object-contain"></div> */}
    <Image
      src="/swarms-logo.svg"
      alt="Swarms logo"
      width={props?.width || 40}
      height={props?.height || 40}
    />
  </Link>
);

export default Logo;
