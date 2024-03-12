'use client';
import CardManager from './components/card-manager';
import Credit from './components/credit';
import SubscriptionStatus from './components/subscription-status';

export default function Account() {
  return (
    <section className="w-full mb-32">
      <div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Account
          </h1>
          {/* charge button */}
          <div className="w-full my-8 flex flex-col gap-4 md:w-2/3  lg:w-2/6">
            <CardManager />
            <Credit />
            <SubscriptionStatus />
          </div>
          {/* show credit */}
        </div>
      </div>
    </section>
  );
}
