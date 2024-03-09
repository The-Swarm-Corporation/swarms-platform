'use client';

import { trpc } from '@/shared/utils/trpc/trpc';

const ApiKeys = () => {
  const test = trpc.test.useQuery();
  console.log(test.data);

  return (
    <div className="flex flex-col w-5/6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">API keys</h1>
      <span className="mt-4 text-muted-foreground">
        Your secret API keys are listed below. Please note that we do not
        display your secret API keys again after you generate them. Do not share
        your API key with others, or expose it in the browser or other
        client-side code. In order to protect the security of your account,
      </span>
      <div className="mt-4"></div>
    </div>
  );
};

export default ApiKeys;
