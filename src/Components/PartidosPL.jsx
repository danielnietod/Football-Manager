import React from 'react'
import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVerticalPL from './MenuVerticalPL';
import MenuHorizontal from './MenuHorizontal';
import { collection, deleteDoc, getDocs, query, where, doc, orderBy } from 'firebase/firestore';

const auth = getAuth(appFirebase);

const PartidosPL = () => {
  const [usuario, setUsuario] = useState(null);
  const [lista, setLista] = useState([]);
  const [equipo, setEquipo] = useState('');


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


  useEffect(() => {
    console.log("Se ejecuta en Partidos")
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);
        //usuarioF = usuarioFirebase.email
        //Obtenemos el ID del equipo del entrenador
        try {
          const IDEquipo = await getEquipoPL(usuarioFirebase.email);
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

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVerticalPL></MenuVerticalPL>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

}

export default PartidosPL
