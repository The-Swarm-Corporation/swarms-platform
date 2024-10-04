import React from 'react';

export default function SwarmsInstallation() {
  return (
    <section className="py-20 text-center">
      <h3 className="text-3xl font-bold mb-8">Installation</h3>
      <div className="bg-gray-100 p-4 rounded-md inline-block mb-8">
        <code className="text-black">pip install -U swarms</code>
      </div>
      <p className="mb-8">Requires Python 3.10 or above</p>
    </section>
  );
}
