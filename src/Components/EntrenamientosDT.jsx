import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVertical from './MenuVertical';
import MenuHorizontal from './MenuHorizontal';
import { sendPlayerNotificationTraining } from '../Notifications/sendEmail';
import { collection, getDocs, query, where, doc, deleteDoc, orderBy } from 'firebase/firestore';

const auth = getAuth(appFirebase);
let usuarioF = "";


const EntrenamientosDT = () => {
  const [usuario, setUsuario] = useState(null);
  const [lista, setLista] = useState([]);
  const [equipo, setEquipo] = useState('');
  const [nombre, setNombre] = useState('');


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

  const enviarNotificaciones = async (entrenamiento) => {
    try {
      // Enviar notificación a los jugadores
      await sendPlayerNotificationTraining(entrenamiento.equipo, entrenamiento.fecha, entrenamiento.hora);
  
      alert('Notificaciones enviadas con éxito');
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
      alert('Error al enviar las notificaciones');
    }
  };

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
          const IDEquipo = await getEquipoDT(usuarioFirebase.email);
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

  // useEffect(() => {
  //   const getLista = async () => {
  //     try {
  //       const querySnapshot = await getDocs(
  //         query(collection(db, 'entrenamientos'), where('equipo', '==', equipo), orderBy('fecha'))
  //       );
  //       const docs = [];
  //       querySnapshot.forEach((doc) => {
  //         console.log("ID entrenamiento: " + doc.id + " equipo: " + equipo);
  //         docs.push({ ...doc.data(), id: doc.id });
  //       });
  //       setLista(docs);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getLista();
  // }, [equipo]);
  

  //Funcion para eliminar un entrenamiento
  const eliminarEntrenamiento = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este entrenamiento?");
    if (confirmacion) {
      await deleteDoc(doc(db, 'entrenamientos', id))
      // Filtrar el entrenamiento eliminado de la lista
      setLista(prevLista => prevLista.filter(entrenamiento => entrenamiento.id !== id));
    }
  }

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVertical></MenuVertical>
      <h2 className='text-center'>Entrenamientos </h2>
      <div className='card-body'>
        <div className='horizontal-table-container'>
          <table className='table'>
            <tbody>
              {lista.map(list => (
                <tr key={list.id}>
                  <td>Fecha: {list.fecha}</td>
                  <td>Hora: {list.hora}</td>
                  <td>
                    <button className='btn btn-danger' onClick={() => eliminarEntrenamiento(list.id)}>Eliminar entrenamiento</button>
                    <NavLink to={`EditarEntrenamientoDT/${list.id}`} className='btn btn-success ms-1'>
                      Editar entrenamiento
                    </NavLink>
                    <button className='btn btn-primary ms-1' onClick={() => enviarNotificaciones(list)}>Enviar notificación</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <NavLink to="CrearEntrenamientoDT">
          <button className='btn btn-success'>
            Crear entrenamiento
          </button>
        </NavLink>
      </div>
    </div>
  )
}

export default EntrenamientosDT
