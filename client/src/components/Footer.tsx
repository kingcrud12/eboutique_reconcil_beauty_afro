import React from 'react'

function Footer() {
  return (
    <footer className="bg-[#1E1E1E] text-white px-8 md:px-20 pt-12 pb-6">
      {/* Top section */}
      <div className="flex flex-col md:flex-row justify-between border-b border-gray-600 pb-10">
        {/* Logo & Description */}
        <div className="mb-10 md:mb-0 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <img src="/AM_LOGO.png" alt="Candleaf Logo" className="w-[100px] h-[90px]" />
            <span className="text-2xl font-bold mt-[-10px]">Réconcil' Afro Beauty</span>
          </div>
          <p className="text-gray-300">
            Your natural candle made for your home and for your wellness.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-16 text-gray-300">
          <div>
            <h4 className="text-green-500 font-semibold mb-4">Nos produits</h4>
            <ul className="space-y-2">
              <li>New season</li>
              <li>Most searched</li>
              <li>Most selled</li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-500 font-semibold mb-4">A propos de nous</h4>
            <ul className="space-y-2">
              <li>Help</li>
              <li>Shipping</li>
              <li>Affiliate</li>
            </ul>
          </div>
          <div>
            <h4 className="text-green-500 font-semibold mb-4">Info</h4>
            <ul className="space-y-2">
              <li>Contact us</li>
              <li>Privacy Policies</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
        <p>©Yann Dipita All Rights Reserved.</p>
        <p>
          Designed with <span className="text-red-500">❤️</span> by <span className="text-white">Yann Dipita</span>
        </p>
      </div>
    </footer>
  )
}

export default Footer
