import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVertical from './MenuVertical';
import { collection, getDocs, query, where, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';

import MenuHorizontal from './MenuHorizontal';

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase);
let usuarioF = "";


const EquipoDT = () => {
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
  const getItemsDT = async (value) => {
    const colRef = collection(db, "entrenadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result)
    return correo[0]
  }

  //Función que regresa el id del equipo de un Entrenador
  // const getNombreDT = async (value) => {
  //   const colRef = collection(db, "entrenadores");
  //   const result = await getDocs(query(colRef, where('email', '==', value)));
  //   const correo = getArrayFromCollection(result)
  //   return correo[0].nombre + " " + correo[0].apellidos
  // }

  //Función que regresa el id de un entrenador segun el correo 
  // const getIDEntrenador = async (value) => {
  //   const colRef = collection(db, "entrenadores");
  //   const result = await getDocs(query(colRef, where('email', '==', value)));
  //   const correo = getArrayFromCollection(result);

  //   if (correo.length > 0) {
  //     const idDT = correo[0].id;
  //     console.log("Este es el id del dt: " + idDT);
  //     return idDT;
  //   } else {
  //     console.log("No se encontró ningún entrenador con el correo proporcionado.");
  //     return null;
  //   }
  // };

  //Función que regresa el link del escudo de un equipo 
  const getLinkEscudo = async (idEquipo) => {
    try {
      const docRef = doc(db, "equipos", idEquipo);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const escudo = docSnap.data().escudo;
        console.log("Link: " + escudo);
        return escudo;
      } else {
        console.log("No se encontró ningún equipo con ese ID.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el enlace del escudo:", error);
      return null;
    }
  };


  // Función que "elimina" a los jugadores de un equipo de un Entrenador
  const eliminarJugadores = async (value) => {
    const newData = {
      equipo: '',
      minutos: '',
      goles: '',
      asistencias: '',
      faltas: '',
      tAmarillas: '',
      tRojas: ''
    }
    const colRef = collection(db, "jugadores");
    const querySnapshot = await getDocs(query(colRef, where('equipo', '==', value)));

    querySnapshot.forEach(async (doc) => {
      const docRef = doc.ref;
      await updateDoc(docRef, newData); // Actualizar el documento
    });
  };

  //Funcion para eliminar todos los partidos de un equipo
  const eliminarPartidosPorEquipo = async (equipo) => {
    const colRef = collection(db, "partidos");
    const querySnapshot = await getDocs(query(colRef, where('equipo', '==', equipo)));

    const eliminacionesPromesas = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await Promise.all(eliminacionesPromesas);
  };

  //Funcion para eliminar todos los entrenamientos de un equipo
  const eliminarEntrenamientosPorEquipo = async (equipo) => {
    const colRef = collection(db, "entrenamientos");
    const querySnapshot = await getDocs(query(colRef, where('equipo', '==', equipo)));

    const eliminacionesPromesas = querySnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await Promise.all(eliminacionesPromesas);
  };



  useEffect(() => {
    console.log("Se ejecuta en Equipo")
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        //setUsuario(usuarioFirebase.id);
        //console.log(usuarioFirebase.id)
        await setEmail(usuarioFirebase.email);
        //const hola = getLinkEscudo("8uv0yygbKNzVfS3AZiWa");
        //Obtenemos la tupla del entrenador
        try {
          console.log(usuarioFirebase.email)
          const entrenadorA = await getItemsDT(usuarioFirebase.email);
          setNombre(entrenadorA.nombre + " " + entrenadorA.apellidos);
          setEquipo(entrenadorA.equipo);

          const getLista = async () => {
            try {
              const querySnapshot = await getDocs(collection(db, 'equipos'))
              const docs = []
              querySnapshot.forEach((doc) => {
                //console.log("ID team: " + doc.id)
                if (doc.id === equipo) {
                  docs.push({ ...doc.data(), id: doc.id });
                }
              })
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

  //Funcion que obtiene los datos del equipo del entrenador
  // useEffect(() => {
  //   const getLista = async () => {
  //     try {
  //       const querySnapshot = await getDocs(collection(db, 'equipos'))
  //       const docs = []
  //       querySnapshot.forEach((doc) => {
  //         console.log("ID team: " + doc.id + " equipo: " + doc.nombre)
  //         if (doc.id === equipo) {
  //           docs.push({ ...doc.data(), id: doc.id });
  //         }
  //       })
  //       setLista(docs)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  //   getLista()
  // }, [equipo]);



  //Funcion que elimina a un equipo
  const eliminarEquipo = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este equipo?");
    if (confirmacion) {
      try {
        //Libera a todos los jugadores del equipo
        await eliminarJugadores(id);

        //Elimina todos los partidos y entrenamientos del equipo
        await eliminarPartidosPorEquipo(id);
        await eliminarEntrenamientosPorEquipo(id);

        //Actualiza el atributo equipo del Entrenador
        const entrenador = await getItemsDT(email);

        await updateDoc(doc(db, 'entrenadores', entrenador.id), {
          equipo: ''
        })

        // Eliminar la imagen del escudo del equipo desde el almacenamiento
        const linkEscudo = await getLinkEscudo(id);
        const escudoRef = ref(storage, linkEscudo);
        await deleteObject(escudoRef);

        //Elimina al equipo
        await deleteDoc(doc(db, 'equipos', id))

        // Recargar la página después de que la tarea haya completado con éxito
        window.location.reload();

      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVertical></MenuVertical>
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
                    </tr><tr>
                      <td>
                        <button className='btn btn-danger' onClick={() => eliminarEquipo(equipo)}>Eliminar equipo</button>
                        <NavLink to={`EditarEquipoDT/${list.id}`} className='btn btn-success ms-1'>
                          Editar equipo
                        </NavLink>
                      </td>
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

export default EquipoDT
