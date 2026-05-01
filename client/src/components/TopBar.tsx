import React from "react";

type TopbarProps = {
  promoCode?: string;
  href?: string;
};

const Topbar: React.FC<TopbarProps> = ({
  promoCode = "EXTRALIV",
  href = `/products`,
}) => {
  return (
    <div className="w-full bg-sage-600 text-white py-2 text-center text-xs sm:text-sm tracking-wide">
      <a
        href={href}
        className="hover:underline transition-colors duration-200"
        aria-label={`Copier code promo ${promoCode}`}
      >
        Livraison offerte* avec le code :{" "}
        <span className="font-bold">{promoCode}</span>
      </a>
    </div>
  );
};

export default Topbar;
