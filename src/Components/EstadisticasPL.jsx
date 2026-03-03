import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVerticalPL from './MenuVerticalPL';
import MenuHorizontal from './MenuHorizontal';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const auth = getAuth(appFirebase);

const EstadisticasPL = () => {
  const [data, setData] = useState({});

  const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
  };

  const getItemPL = async (value) => {
    const colRef = collection(db, "jugadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result);
    return correo[0];
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        try {
          setData(await getItemPL(usuarioFirebase.email));
          console.log(data)

        } catch (error) {
          console.error(error);
        }
      }
    });
  }, []);


  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVerticalPL />
      <h2 className='text-center'>Estadísticas personales</h2>
      <div className='card-body' style={{ marginLeft: '250px', padding: '20px' }}>
        <div className='horizontal-table-container'>
          <table className='table'>
            <tbody>
              <tr>
                <td>Nombre: {data.nombre} {data.apellidos}</td>
                <td>Posicion: {data.posicion}</td>
                <td>Minutos: {data.minutos}</td>
                <td>Goles: {data.goles}</td>
                <td>Asistencias: {data.asistencias}</td>
                <td>Faltas: {data.faltas}</td>
                <td>Tarjetas amarillas: {data.tAmarillas}</td>
                <td>Tarjetas rojas: {data.tRojas}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPL;
