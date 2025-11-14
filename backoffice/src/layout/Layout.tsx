import React from 'react';
import Menu from '../components/Menu';
import FilterMenu from '../components/FilterMenu';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Menu vertical à gauche */}
      <Menu />

      {/* Contenu principal à droite */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <FilterMenu /> {/* Affiché en haut du contenu principal */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
