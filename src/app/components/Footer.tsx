import { Link } from "react-router-dom";
import { Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", path: "/features" },
      { label: "Pricing", path: "/pricing" },
      { label: "AI Analysis", path: "/upload" },
      { label: "Products", path: "/products" },
    ],
    company: [
      { label: "About Us", path: "/about" },
      { label: "Careers", path: "/careers" },
      { label: "Blog", path: "/blog" },
      { label: "Press", path: "/press" },
    ],
    support: [
      { label: "Help Center", path: "/help" },
      { label: "Contact Us", path: "/contact" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, label: "Facebook", url: "https://facebook.com" },
    { icon: Twitter, label: "Twitter", url: "https://twitter.com" },
    { icon: Instagram, label: "Instagram", url: "https://instagram.com" },
    { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com" },
  ];

  return (
    <footer
      className="bg-white dark:bg-gray-900 border-t border-purple-200 dark:border-gray-800 mt-20"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded-lg w-fit"
              aria-label="DeepSkyn Home"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b63d3] to-[#b89de6] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl text-gray-800 dark:text-white">
                DeepSkyn
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
              AI-powered skincare analysis and personalized recommendations for your unique beauty journey.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:hello@deepskyn.com"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#8b63d3] dark:hover:text-[#b89de6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded w-fit"
                aria-label="Email us at hello@deepskyn.com"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>hello@deepskyn.com</span>
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#8b63d3] dark:hover:text-[#b89de6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded w-fit"
                aria-label="Call us at +1 555 123 4567"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>+1 (555) 123-4567</span>
              </a>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>San Francisco, CA 94102</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">Product</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#8b63d3] dark:hover:text-[#b89de6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">Company</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#8b63d3] dark:hover:text-[#b89de6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-gray-800 dark:text-white mb-4">Support</h3>
            <ul className="space-y-2" role="list">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-[#8b63d3] dark:hover:text-[#b89de6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-purple-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} DeepSkyn. All rights reserved.
          </p>

          <div className="flex items-center gap-4" role="list" aria-label="Social media links">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-purple-100 dark:bg-gray-800 hover:bg-[#8b63d3] dark:hover:bg-[#8b63d3] text-[#8b63d3] hover:text-white transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#8b63d3]"
                  aria-label={`Visit our ${social.label} page (opens in new tab)`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Accessibility Statement */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Committed to digital accessibility. If you have difficulty using this site, please{" "}
            <Link
              to="/contact"
              className="text-[#8b63d3] hover:underline focus:outline-none focus:ring-2 focus:ring-[#8b63d3] rounded"
            >
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
