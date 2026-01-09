import {Link} from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-blue-100 bg-white/50 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold mb-3 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>TestHub</span>
            </Link>
            <p className="text-sm text-slate-600">
              Modern platform for online testing and learning assessment.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link 
                  href="/features" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/security" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Security
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-blue-600 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link 
                  href="/privacy" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="hover:text-blue-600 transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-100 pt-6 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} TestHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}