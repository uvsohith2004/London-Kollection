import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919985542871";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-20 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div>
          <h3 className="text-lg font-display font-semibold tracking-wide mb-6">
            London Kollection
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed font-light">
            Carefully curated jewellery and accessories. 
            Designed for elegance. Delivered with care.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6 text-gray-300 font-semibold">
            Shop
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link to="/shop/Bangles" className="hover:text-blue-400 transition font-light">
                Bangles
              </Link>
            </li>
            <li>
              <Link to="/shop/Necklaces" className="hover:text-blue-400 transition font-light">
                Necklaces
              </Link>
            </li>
            <li>
              <Link to="/shop/Earrings" className="hover:text-blue-400 transition font-light">
                Earrings
              </Link>
            </li>
            <li>
              <Link to="/shop/Watches" className="hover:text-blue-400 transition font-light">
                Watches
              </Link>
            </li>
            <li>
              <Link to="/shop/Handbags" className="hover:text-blue-400 transition font-light">
                Handbags
              </Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6 text-gray-300 font-semibold">
            Help
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <span className="hover:text-blue-400 transition cursor-pointer font-light block">
                Delivery Information
              </span>
            </li>
            <li>
              <span className="hover:text-blue-400 transition cursor-pointer font-light block">
                Returns & Exchanges
              </span>
            </li>
            <li>
              <span className="hover:text-blue-400 transition cursor-pointer font-light block">
                Privacy Policy
              </span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs uppercase tracking-widest mb-6 text-gray-300 font-semibold">
            Contact
          </h4>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition font-light mb-4"
          >
            <MessageCircle size={16} />
            WhatsApp Us
          </a>

          <p className="text-sm text-gray-400 font-light">
            Kuwait City, Kuwait
          </p>
        </div>

      </div>

      {/* Bottom Divider */}
      <div className="border-t border-gray-800" />

      {/* Bottom */}
      <div className="container py-8 text-center text-xs text-gray-500 font-light">
        © {new Date().getFullYear()} London Kollection. All rights reserved.
      </div>
    </footer>
  );
}