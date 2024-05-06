import localFont from 'next/font/local';

export const helvetica = localFont({
  src: [
    {
      path: 'fonts/helvetica/helvetica.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: 'fonts/helvetica/helvetica-bold.woff',
      weight: '700',
      style: 'bold',
    },
    {
      path: 'fonts/helvetica/helvetica-light.woff',
      weight: '300',
      style: 'light',
    },
  ],
});
