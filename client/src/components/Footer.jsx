function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
      <p>© {new Date().getFullYear()} ZenSprint. All rights, roasts, and sarcastic remarks reserved.</p>
      <p className="mt-2 text-zinc-600">Built to make productivity feel lighter (and slightly more offensive).</p>
    </footer>
  );
}

export default Footer;
