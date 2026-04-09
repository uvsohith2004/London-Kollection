import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "919985542871";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold tracking-wide mb-4">
            LONDON COLLECTION
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Carefully curated ornaments, watches and accessories.
            Designed for elegance. Delivered with care.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4 text-gray-300">
            Shop
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <Link to="/shop/Bangles" className="hover:text-white transition">
                Bangles
              </Link>
            </li>
            <li>
              <Link to="/shop/Necklaces" className="hover:text-white transition">
                Necklaces
              </Link>
            </li>
            <li>
              <Link to="/shop/Earrings" className="hover:text-white transition">
                Earrings
              </Link>
            </li>
            <li>
              <Link to="/shop/Watches" className="hover:text-white transition">
                Watches
              </Link>
            </li>
            <li>
              <Link to="/shop/Handbags" className="hover:text-white transition">
                Handbags
              </Link>
            </li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4 text-gray-300">
            Help
          </h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <span className="hover:text-white transition cursor-pointer">
                Delivery Information
              </span>
            </li>
            <li>
              <span className="hover:text-white transition cursor-pointer">
                Returns & Exchanges
              </span>
            </li>
            <li>
              <span className="hover:text-white transition cursor-pointer">
                Privacy Policy
              </span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-4 text-gray-300">
            Contact
          </h4>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <MessageCircle size={16} />
            WhatsApp Us
          </a>

          <p className="text-sm text-gray-400 mt-3">
            Kuwait City, Kuwait
          </p>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} London Collection. All rights reserved.
      </div>
    </footer>
  );
}