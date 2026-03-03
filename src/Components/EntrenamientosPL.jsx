import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVerticalPL from './MenuVerticalPL';
import MenuHorizontal from './MenuHorizontal';
import { collection, getDocs, query, where, doc, deleteDoc, orderBy } from 'firebase/firestore';

const auth = getAuth(appFirebase);
let usuarioF = "";


const EntrenamientosPL = () => {
  const [usuario, setUsuario] = useState(null);
  const [lista, setLista] = useState([]);
  const [equipo, setEquipo] = useState('');
  const [nombre, setNombre] = useState('');


  const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
  }

  //Función que regresa el id del equipo de un Jugador
  const getEquipoPL = async (value) => {
    const colRef = collection(db, "jugadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result)
    return correo[0].equipo
  }

  //Función que regresa el id del equipo de un Entrenador
  // const getNombreDT = async (value) => {
  //   const colRef = collection(db, "entrenadores");
  //   const result = await getDocs(query(colRef, where('email', '==', value)));
  //   const correo = await getArrayFromCollection(result)
  //   return correo[0].nombre + " " + correo[0].apellidos
  // }


  useEffect(() => {
    console.log("Se ejecuta en Entrenamiento")
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);
        //Obtenemos el ID del equipo del entrenador
        try {
          const IDEquipo = await getEquipoPL(usuarioFirebase.email);
          setEquipo(IDEquipo);
          //Obtenemos la lista de entrenamientos del equipo
          try {
            const querySnapshot = await getDocs(
              query(collection(db, 'entrenamientos'), where('equipo', '==', equipo), orderBy('fecha'))
            );
            const docs = [];
            querySnapshot.forEach((doc) => {
              console.log("ID entrenamiento: " + doc.id + " equipo: " + equipo);
              docs.push({ ...doc.data(), id: doc.id });
            });
            setLista(docs);
          } catch (error) {
            console.log(error);
          }
        } catch (error) {
          console.error(error);
        }
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
      <h2 className='text-center'>Entrenamientos </h2>
      <div className='card-body'>
        <div className='horizontal-table-container'>
          <table className='table'>
            <tbody>
              {lista.map(list => (
                <tr key={list.id}>
                  <td>Fecha: {list.fecha}</td>
                  <td>Hora: {list.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EntrenamientosPL
