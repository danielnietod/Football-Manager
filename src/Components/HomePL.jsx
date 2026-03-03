import React, { useEffect, useState } from 'react'
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import {getAuth, signOut, onAuthStateChanged} from 'firebase/auth'
import { NavLink } from 'react-router-dom';
import CalendarComponent from './CalendarComponent';
import MenuHorizontal from './MenuHorizontal';
import { collection, getDocs, query, where } from 'firebase/firestore';

const auth = getAuth(appFirebase);

const HomePL = ({correoUsuario}) => {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState('');

  const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
  }

  //Función que regresa el nombre y apellidos  de un Jugador
  const getNombreDT = async (value) => {
    const colRef = collection(db, "jugadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result)
    return correo[0].nombre + " " + correo[0].apellidos
  }

  useEffect(()=>{
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);
        console.log(usuarioFirebase.email)
        const correo = usuarioFirebase.email
        try {
          const name = await getNombreDT(correo)
          setNombre(name)
        } catch (error) {
          console.log(error)
        }
      }
      else{
        setUsuario(null);
        console.log(usuarioFirebase)
      }
      
    })
  },[])

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
        <h2 className='text-center'>Bienvenido jugador, {nombre} <br/></h2>

        <div className='calendar-container'>
          <CalendarComponent></CalendarComponent>
        </div>
        
    </div>
  )
}

export default HomePL