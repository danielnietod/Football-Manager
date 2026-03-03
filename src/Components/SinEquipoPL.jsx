import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase } from '../Firebase/firebaseConfiguration';
import MenuHorizontal from './MenuHorizontal';

const auth = getAuth(appFirebase);
let usuarioF = "";

const SinEquipoPL = () => {
  // const [usuario, setUsuario] = useState(null);
  //   useEffect(()=>{
  //       onAuthStateChanged(auth, (usuarioFirebase) => {
  //         if (usuarioFirebase) {
  //           setUsuario(usuarioFirebase);
  //           console.log("Fire: "+usuarioFirebase.email)
  //           usuarioF = usuarioFirebase.email;
  //         }
  //         else{
  //           setUsuario(null);
  //           console.log(usuarioFirebase)
  //         }
  //       })
  //     },[])
  return (
    <div>
      <MenuHorizontal/>
        <p className='text-center'>Aún no has sido inscrito a un equipo. </p>
    </div>
  )
}

export default SinEquipoPL