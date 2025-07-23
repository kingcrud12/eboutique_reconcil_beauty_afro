import React from "react";
import { Star, StarHalf } from "lucide-react";

const testimonials = [
  {
    name: "Luisa",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
    quote: "I love it! No more air fresheners",
    rating: 4.5,
  },
  {
    name: "Edoardo",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote: "Raccomended for everyone",
    rating: 5,
  },
  {
    name: "Mart",
    image: "https://randomuser.me/api/portraits/women/66.jpg",
    quote: "Looks very natural, the smell is awesome",
    rating: 4.5,
  },
];

function getStars(rating: number) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="h-5 w-5 text-green-500 fill-green-500" />);
  }

  if (halfStar) {
    stars.push(<StarHalf key="half" className="h-5 w-5 text-green-500 fill-green-500" />);
  }

  return stars;
}

export default function Testimony() {
  return (
    <section className="bg-[#f0f9f5] py-16 px-4">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-slate-800">Ils ont adoré</h2>
        <p className="text-slate-500 mt-2">Some quotes from our happy customers</p>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center w-full md:w-1/3 text-center"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm"
            />
            <div className="flex justify-center mb-2">{getStars(t.rating)}</div>
            <p className="text-lg font-medium text-slate-800">“{t.quote}”</p>
            <p className="mt-2 text-slate-500">{t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
