import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVerticalPL from './MenuVerticalPL';
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';

import MenuHorizontal from './MenuHorizontal';

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase);


const EquipoPL = () => {
  //const [usuario, setUsuario] = useState(null);
  const [email, setEmail] = useState(null);
  const [lista, setLista] = useState([]);
  const [equipo, setEquipo] = useState('');
  const [nombre, setNombre] = useState('');


  const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
  }

  //Función que regresa el id del equipo de un Entrenador
  const getItemsPL = async (value) => {
    const colRef = collection(db, "jugadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result)
    return correo[0]
  }

  //Función que regresa el nombre de un Entrenador
  const getNameDT = async (value) => {
    const colRef = collection(db, "entrenadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result)
    return correo[0].nombre + " " + correo[0].apellidos
  }

  useEffect(() => {
    console.log("Se ejecuta en EquipoPL")
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        //setUsuario(usuarioFirebase.id);
        //console.log(usuarioFirebase.id)
        setEmail(usuarioFirebase.email);
        //const hola = getLinkEscudo("8uv0yygbKNzVfS3AZiWa");
        //Obtenemos la tupla del jugador
        try {
          console.log(usuarioFirebase.email)
          const jugadorA = await getItemsPL(usuarioFirebase.email);
          setEquipo(jugadorA.equipo);

          const getLista = async () => {
            try {
              let entrenador = "";
              const querySnapshot = await getDocs(collection(db, 'equipos'))
              const docs = []
              //console.log("DDTDTD: "+equipo)
              querySnapshot.forEach((doc) => {
                //console.log("ID team: " + doc.id)
                if (doc.id === equipo) {
                  docs.push({ ...doc.data(), id: doc.id });
                  entrenador = doc.data().entrenador;
                  console.log("JAJAJA: "+entrenador)
                }
              })
              setNombre(await getNameDT(entrenador));
              setLista(docs)
            } catch (error) {
              console.log(error)
            }
          }
          getLista()
        } catch (error) {
          console.error(error);
        }
        //Obtenemos el ID del equipo del entrenador
        // try {
        //   const IDEquipo = await getEquipoDT(usuarioF);
        //   setEquipo(IDEquipo);
        // } catch (error) {
        //   console.error(error);
        // }
      }
      else {
        setUsuario(null);
        console.log(usuarioFirebase)
      }
    })
  }, [equipo]);

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVerticalPL/>
      <div className='card-body'>
        <div className='table-container'>
          <div className='table-wrapper'>
            <table className='table'>
              <tbody>
                {lista.map(list => (
                  <><tr key={list.id}>
                    <td>
                      <img src={list.escudo} alt='Escudo del equipo' className='escudo' />
                    </td>
                  </tr><tr>
                      <td>Nombre: {list.nombre}</td>
                    </tr><tr>
                      <td>Instalaciones: {list.direccion}</td>
                    </tr><tr>
                      <td>Entrenador: {nombre}</td>
                    </tr><tr>
                      <td>Teléfono: {list.telefono}</td>
                    </tr></>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipoPL
