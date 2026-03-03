// MenuVertical.js

import React from 'react';
import { NavLink } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { appFirebase } from '../Firebase/firebaseConfiguration';

const auth = getAuth(appFirebase);

const MenuHorizontal = () => {
  return (
    <menu className='menu'>
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/Equipo">Equipo</NavLink>
        <NavLink to="/Perfil">Perfil</NavLink>
        <a className='link' onClick={() => signOut(auth)}>Salir</a>
    </menu>
  );
}

export default MenuHorizontal;
