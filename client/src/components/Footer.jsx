const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-[#1c1c1c] text-gray-400 mt-auto">
      <aside>
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} IPCL Solar Management. All rights reserved.
        </p>
      </aside>
    </footer>
  );
};

export default Footer;