// MenuVertical.js

import React from 'react';
import { NavLink } from 'react-router-dom';

const MenuVertical = () => {
  return (
    <div className="menu-vertical">
      <ul className='list-group'>
        <li className="list-group-item"><NavLink to="/Equipo">Equipo</NavLink></li>
        <li className="list-group-item"><NavLink to="/Equipo/Partidos">Partidos</NavLink></li>
        <li className="list-group-item"><NavLink to="/Equipo/Entrenamientos">Entrenamientos</NavLink></li>
        <li className="list-group-item"><NavLink to="/Equipo/Jugadores">Jugadores</NavLink></li>
        <li className="list-group-item"><NavLink to="/Equipo/Estadisticas">Estadisticas</NavLink></li>
      </ul>
    </div>
  );
}

export default MenuVertical;
