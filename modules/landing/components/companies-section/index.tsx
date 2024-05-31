import Image from 'next/image';

const companies = [
  {
    name: 'GM',
    logo: '/images/companies/gm.png',
    link: '#',
  },
  {
    name: 'John Deere',
    logo: '/images/companies/john-deere.svg',
    link: '#',
  },
  {
    name: 'RBC',
    logo: '/images/companies/rbc.svg',
    link: '#',
  },
  {
    name: 'Wisdolia',
    logo: '/images/companies/wisdolia.svg',
    link: '#',
  },
  {
    name: 'Minecraft',
    logo: '/images/companies/minecraft.png',
    link: '#',
  },
  {
    name: 'Trident AI',
    logo: '/images/companies/tridentai.webp',
    link: '#',
  },
];

const CompaniesSection = () => {
  return (
    <section className="">
      <div className="py-16 lg:py-24 mx-auto max-w-screen-xl px-4">
        <h2 className="mb-8 lg:mb-16 text-6xl font-extrabold tracking-tight leading-tight text-center text-gray-900 dark:text-white">
          Used By
        </h2>
        <div className="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400">
          {companies.map((company, index) => {
            return (
              <a
                key={`LANDING_COMPANY_${index}`}
                href="#"
                className="flex justify-between items-center flex-col gap-2 hover:scale-110 transition-transform duration-300"
              >
                <div
                  className={
                    company.name === 'GM' ? 'bg-black rounded-[17px]' : ''
                  }
                >
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={100}
                    height={100}
                  />
                </div>
                <p className="font-bold text-2xl text-center">{company.name}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CompaniesSection;
