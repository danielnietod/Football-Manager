import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuVertical from './MenuVertical';
import MenuHorizontal from './MenuHorizontal';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const auth = getAuth(appFirebase);

const EstadisticasDT = () => {
  const [lista, setLista] = useState([]);
  const [equipo, setEquipo] = useState('');
  const [idActual, setIDActual] = useState(null);
  const [editingData, setEditingData] = useState({});

  const getArrayFromCollection = (collection) => {
    return collection.docs.map(doc => {
      return { ...doc.data(), id: doc.id };
    });
  };

  const getEquipoDT = async (value) => {
    const colRef = collection(db, "entrenadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    const correo = getArrayFromCollection(result);
    return correo[0].equipo;
  };

  //Funcion que renderiza la lista de jugadores
  const fetchJugadores = async (equipo) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'jugadores'));
      const docs = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().equipo === equipo) {
          docs.push({ ...doc.data(), id: doc.id });
        }
      });
      setLista(docs);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (usuarioFirebase) {
        try {
          const IDEquipo = await getEquipoDT(usuarioFirebase.email);
          setEquipo(IDEquipo);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (equipo) {
      fetchJugadores(equipo);
    }
  }, [equipo]);

  const isNumeric = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const handleEdit = (id, field, value) => {
    if (isNumeric(value) || value === '') {
      setIDActual(id);
      setEditingData({ ...editingData, [field]: value });
    } else {
      alert("Solo acepta valores numericos.");
    }
  };

  const actualizarEstadisticas = async (id) => {
    try {
      await updateDoc(doc(db, 'jugadores', id), editingData);
      setIDActual(null);
      setEditingData({});
      fetchJugadores(equipo);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <MenuHorizontal></MenuHorizontal>
      <MenuVertical></MenuVertical>
      <h2 className='text-center'>Estadísticas</h2>
      <div className='card-body' style={{marginLeft: '250px', padding: '20px'}}>
        <div className='horizontal-table-container'>
          <table className='table'>
            <tbody>
              {lista.map(list => (
                <tr key={list.id}>
                  <td>Nombre: {list.nombre} {list.apellidos}</td>
                  <td>Posicion: {list.posicion}</td>
                  <td>Minutos: {idActual === list.id ?
                    <input
                      type="num"
                      className='caja-textorg'
                      value={editingData.minutos}
                      onChange={(e) => handleEdit(list.id, 'minutos', e.target.value)}
                    /> :
                    list.minutos}
                  </td>
                  <td>Goles: {idActual === list.id ?
                    <input
                      type="num"
                      className='caja-textorg'
                      value={editingData.goles}
                      onChange={(e) => handleEdit(list.id, 'goles', e.target.value)}
                    /> :
                    list.goles}
                  </td>
                  <td>Asistencias: {idActual === list.id ?
                    <input
                      type="num"
                      className='caja-textorg'
                      value={editingData.asistencias}
                      onChange={(e) => handleEdit(list.id, 'asistencias', e.target.value)}
                    /> :
                    list.asistencias}
                  </td>
                  <td>Faltas: {idActual === list.id ?
                    <input
                      type="num"
                      className='caja-textorg'
                      value={editingData.faltas}
                      onChange={(e) => handleEdit(list.id, 'faltas', e.target.value)}
                    /> :
                    list.faltas}
                  </td>
                  <td>Tarjetas amarillas: {idActual === list.id ?
                    <input
                      type="num"
                      className='caja-textorg'
                      value={editingData.tAmarillas}
                      onChange={(e) => handleEdit(list.id, 'tAmarillas', e.target.value)}
                    /> :
                    list.tAmarillas}
                  </td>
                  <td>Tarjetas rojas: {idActual === list.id ?
                    <input
                      type="num"
                      className='caja-textorg'
                      value={editingData.tRojas}
                      onChange={(e) => handleEdit(list.id, 'tRojas', e.target.value)}
                    /> :
                    list.tRojas}
                  </td>
                  <td>
                    {idActual === list.id ?
                      <button className='btn btn-success' onClick={() => actualizarEstadisticas(list.id)}>Guardar</button> :
                      <button className='btn btn-primary' onClick={() => setIDActual(list.id)}>Editar</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasDT;
