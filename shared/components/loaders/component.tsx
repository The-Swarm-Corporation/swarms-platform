import LoadingSpinner from '../loading-spinner';

export default function ComponentLoader() {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[10000] flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.8)] text-center">
      <div className="animate-spin duration-1000">
        <LoadingSpinner />
      </div>
    </div>
  );
}
