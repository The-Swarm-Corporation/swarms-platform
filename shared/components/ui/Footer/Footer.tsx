export default function Footer() {
  return (
    <footer className="flex justify-center text-xs md:text-base text-foreground pt-12 pb-6">
      <span className="text-center">
        &copy; {new Date().getFullYear()} TGSC, Inc. All rights reserved.
      </span>
    </footer>
  );
}
