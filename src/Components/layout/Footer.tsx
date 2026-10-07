import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto text-slate-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="BlooCube" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-slate-900">BlooCube</span>
          </div>
          <p className="text-slate-500 text-sm">Brands post. Creators apply. Deals happen.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-slate-900 text-sm">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/find-creators" className="hover:text-indigo-600 transition-colors">Find Creators</Link></li>
            <li><Link href="/campaigns" className="hover:text-indigo-600 transition-colors">Campaigns</Link></li>
            <li><Link href="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-slate-900 text-sm">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</Link></li>
            <li><Link href="/resources" className="hover:text-indigo-600 transition-colors">Resources</Link></li>
            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-slate-900 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cancellation-refund" className="hover:text-indigo-600 transition-colors">Cancellation & Refund Policy</Link></li>
            <li><Link href="/shipping-delivery" className="hover:text-indigo-600 transition-colors">Shipping & Delivery Policy</Link></li>
            <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} BlooCube. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
