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


const AgregarJugadoresDT = () => {
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

    useEffect(() => {
        console.log("Se ejecuta en Jugadores")
        onAuthStateChanged(auth, async (usuarioFirebase) => {
            if (usuarioFirebase) {
                setUsuario(usuarioFirebase);
                usuarioF = usuarioFirebase.email
                //Obtenemos el ID del equipo del entrenador
                try {
                    const IDEquipo = await getEquipoDT(usuarioF);
                    setEquipo(IDEquipo);
                } catch (error) {
                    console.error(error);
                }
            }
            else {
                setUsuario(null);
                console.log(usuarioFirebase)
            }
        })
    }, []);

    //Funcion para renderizar la lista de jugadores
    useEffect(() => {
        const getLista = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'jugadores'))
                const docs = []
                querySnapshot.forEach((doc) => {
                    if (doc.data().equipo === "") {
                        docs.push({ ...doc.data(), id: doc.id });
                    }
                })
                setLista(docs)
            } catch (error) {
                console.log(error)
            }
        }
        getLista()
    }, [equipo]);

    //Funcion que agrega un jugador a un equipo
    const nuevoJugador = async(id) =>{
        try {
            await updateDoc(doc(db, 'jugadores', id), {
                equipo: equipo
            });
        } catch (error) {
            console.log(error)
        }
        // Filtrar el jugador eliminado de la lista
        setLista(prevLista => prevLista.filter(jugador => jugador.id !== id));
    }


    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='padre'>
                        <div className='card card-body shadow-lg'>
                            <h2>Añadir jugadores</h2><br />
                            <div className='horizontal-table-container'>
                                <table className='table'>
                                    <tbody>
                                        {lista.map(list => (
                                            <tr key={list.id}>
                                                <td>Nombre: {list.nombre} {list.apellidos}</td>
                                                <td>Posicion: {list.posicion}</td>
                                                <td>
                                                    <button className='btn btn-success ms-1' onClick={() => nuevoJugador(list.id)}>Añadir jugador</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <NavLink to="/Equipo/Jugadores"><button className='btn btn-primary'>Regresar</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default AgregarJugadoresDT
