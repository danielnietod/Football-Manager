import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVertical from './MenuVertical';
import MenuHorizontal from './MenuHorizontal';
import { sendPlayerNotification } from '../Notifications/sendEmail';
import { collection, deleteDoc, getDocs, query, where, doc, orderBy } from 'firebase/firestore';

const auth = getAuth(appFirebase);

const PartidosDT = () => {
  const [usuario, setUsuario] = useState(null);
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

  const enviarNotificaciones = async (partido) => {
    try {
      // Enviar notificación a los jugadores
      await sendPlayerNotification(partido.equipo, partido.fecha, partido.rival);
      // Enviar notificación al entrenador
      //await sendCoachNotification(partido.equipo, partido.fecha, partido.rival);
  
      alert('Notificaciones enviadas con éxito');
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
      alert('Error al enviar las notificaciones');
    }
  };
  

  //Función que regresa el nombre de un Entrenador
  // const getNombreDT = async (value) => {
  //   const colRef = collection(db, "entrenadores");
  //   const result = await getDocs(query(colRef, where('email', '==', value)));
  //   const correo = await getArrayFromCollection(result)
  //   return correo[0].nombre + " " + correo[0].apellidos
  // }


  useEffect(() => {
    console.log("Se ejecuta en Partidos")
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);
        //usuarioF = usuarioFirebase.email
        //Obtenemos el ID del equipo del entrenador
        try {
          const IDEquipo = await getEquipoDT(usuarioFirebase.email);
          setEquipo(IDEquipo);
          
          //Pbtenemos la lista de partidos
          try {
            const querySnapshot = await getDocs(
              query(collection(db, 'partidos'), where('equipo', '==', equipo), orderBy('fecha'))
            );
            const docs = [];
            querySnapshot.forEach((doc) => {
              console.log("ID partido: " + doc.id + " equipo: " + doc.data().equipo)
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
  //         query(collection(db, 'partidos'), where('equipo', '==', equipo), orderBy('fecha'))
  //       );
  //       const docs = [];
  //       querySnapshot.forEach((doc) => {
  //         console.log("ID partido: " + doc.id + " equipo: " + doc.data().equipo)
  //         docs.push({ ...doc.data(), id: doc.id });
  //       });
  //       setLista(docs);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   getLista();
  // }, [equipo]);


  //Funcion para eliminar un partido
  const eliminarPartido = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este partido?");
    if (confirmacion) {
      await deleteDoc(doc(db, 'partidos', id))
      // Filtrar el partido eliminado de la lista
      setLista(prevLista => prevLista.filter(partido => partido.id !== id));
    }
  }

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVertical></MenuVertical>
      <h2 className='text-center'>Partidos</h2>
      <div className='card-body'>
        <div className='horizontal-table-container'>
          <table className='table'>
            <tbody>
              {lista.map(list => (
                <tr key={list.id}>
                  <td>Rival: {list.rival}</td>
                  <td>Fecha: {list.fecha}</td>
                  <td>Resultado: {list.golesFavor} - {list.golesContra}</td>
                  <td>
                    <button className='btn btn-danger' onClick={() => eliminarPartido(list.id)}>Eliminar partido</button>
                    <NavLink to={`EditarPartidoDT/${list.id}`} className='btn btn-success ms-1'>
                      Editar partido
                    </NavLink>
                    <button className='btn btn-primary ms-1' onClick={() => enviarNotificaciones(list)}>Enviar notificación</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <NavLink to="CrearPartidoDT">
          <button className='btn btn-success'>
            Crear partido
          </button>
        </NavLink>
      </div>
    </div>
  );

}

export default PartidosDT
