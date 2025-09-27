import React from "react";

type TopbarProps = {
  promoCode?: string;
  href?: string;
};

const Topbar: React.FC<TopbarProps> = ({
  promoCode = "EXTRALIV",
  href = `/products/offres-az?copy=EXTRALIV`,
}) => {
  return (
    <div className="w-full bg-indigo-600 text-black py-2 flex justify-center">
      <a
        href={href}
        className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-md hover:bg-gray-100 transition"
        aria-label={`Copier code promo ${promoCode}`}
      >
        Livraison offerte* avec le code :{" "}
        <span className="font-bold">{promoCode}</span>
      </a>
    </div>
  );
};

export default Topbar;
