import React from 'react';
import { Filter } from 'lucide-react';

function FilterMenu() {
  return (
    <div className="flex justify-between items-center bg-white px-4 py-3 mb-6 shadow-sm h-[100px]">
      
      {/* Bouton Filtre avec icône */}
      <button className="flex items-center gap-2 text-gray-700 font-medium text-sm border-r pr-4">
        <Filter className="w-4 h-4" />
        Filtre
        <span className="ml-1">&#x25BE;</span> {/* chevron bas unicode */}
      </button>

      {/* Actions à droite */}
      <div className="flex items-center gap-3">
        <button className="border border-gray-300 px-4 py-1.5 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
          Réinitialiser les filtres
        </button>
        <button className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-900">
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default FilterMenu;
