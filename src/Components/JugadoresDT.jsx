import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVertical from './MenuVertical';
import MenuHorizontal from './MenuHorizontal';
import { collection, deleteDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const auth = getAuth(appFirebase);
let usuarioF = "";


const JugadoresDT = () => {
  const [lista, setLista] = useState([]);
  const [equipo, setEquipo] = useState('');

  const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
  }

  //Función que regresa el id del equipo de un Entrenador
  const getEquipoDT = async (value) => {
    const colRef = collection(db, "entrenadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result)
    return correo[0].equipo
  }



  useEffect(() => {
    console.log("Se ejecuta en Jugadores")
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        //Obtenemos el ID del equipo del entrenador
        try {
          const IDEquipo = await getEquipoDT(usuarioFirebase.email);
          setEquipo(IDEquipo);
          //Renderizamos la lista de jugadores del equipo
          try {
            const querySnapshot = await getDocs(collection(db, 'jugadores'))
            const docs = []
            querySnapshot.forEach((doc) => {
              console.log("ID jugador: " + doc.id + " equipo: " + doc.data().equipo)
              if (doc.data().equipo === equipo) {
                docs.push({ ...doc.data(), id: doc.id });
              }
            })
            setLista(docs)
          } catch (error) {
            console.log(error)
          }
        } catch (error) {
          console.error(error);
        }
      }
    })
  }, [equipo]);

  //Funcion que "elimina" a un jugador del equipo
  const eliminarJugador = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este jugador?");
    if (confirmacion) {
      try {
        await updateDoc(doc(db, 'jugadores', id), {
          equipo: '',
          minutos: '',
          goles: '',
          asistencias: '',
          faltas: '',
          tAmarillas: '',
          tRojas: ''
  
        });
      } catch (error) {
        console.log(error)
      }
      // Filtrar el jugador eliminado de la lista
      setLista(prevLista => prevLista.filter(jugador => jugador.id !== id));
      
    }  
  }


  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVertical></MenuVertical>
      <h2 className='text-center'>Jugadores</h2>
      <div className='card-body'>
        <div className='horizontal-table-container'>
          <table className='table'>
            <tbody>
              {lista.map(list => (
                <tr key={list.id}>
                  <td>Nombre: {list.nombre} {list.apellidos}</td>
                  <td>Posicion: {list.posicion}</td>
                  <td>
                    <button className='btn btn-danger' onClick={() => eliminarJugador(list.id)}>Eliminar jugador</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <NavLink to="AgregarJugadoresDT">
          <button className='btn btn-success'>
            Añadir jugadores
          </button>
        </NavLink>
      </div>
    </div>
  );

}

export default JugadoresDT
