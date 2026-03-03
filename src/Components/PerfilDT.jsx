import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import MenuHorizontal from './MenuHorizontal';
import { collection, getDoc, query, where, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';


const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase);

const PerfilDT = () => {
    const [usuario, setUsuario] = useState(null);
    const [lista, setLista] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [email, setEmail] = useState('');
    const [equipo, setEquipo] = useState('');

    const navigate = useNavigate();


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

    //Función que regresa el id de un entrenador segun el correo 
    // const getID_DT = async (value) => {
    //     const colRef = collection(db, "entrenadores");
    //     const result = await getDocs(query(colRef, where('email', '==', value)));
    //     const correo = getArrayFromCollection(result);

    //     if (correo.length > 0) {
    //         const idDT = correo[0].id;
    //         console.log("Este es el id del dt: " + idDT);
    //         return idDT;
    //     } else {
    //         console.log("No se encontró ningún entrenador con el correo proporcionado.");
    //         return null;
    //     }
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

    //Funciones para eliminar el perfil
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

    //Funcion para eliminar la cuenta del usuario y realizar limpieza
    const eliminarPerfil = async (id) => {
        const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este perfil?");
        if (confirmacion) {
            // Pide al usuario que vuelva a autenticarse para confirmar su identidad
            const password = prompt("Por favor, ingresa tu contraseña para confirmar la eliminación de tu cuenta:");

            try {
                // Reautenticar al usuario con la contraseña proporcionada
                const credential = EmailAuthProvider.credential(email, password);
                await reauthenticateWithCredential(auth.currentUser, credential);

                console.log("el id del equipo: " + id);
                if (id !== '') {
                    console.log("el id del equipo: " + id);
                    //Libera a todos los jugadores del equipo
                    await eliminarJugadores(id);

                    //Elimina todos los partidos y entrenamientos del equipo
                    await eliminarPartidosPorEquipo(id);
                    await eliminarEntrenamientosPorEquipo(id);

                    // Eliminar la imagen del escudo del equipo desde el almacenamiento
                    const linkEscudo = await getLinkEscudo(id);
                    const escudoRef = ref(storage, linkEscudo);
                    await deleteObject(escudoRef);

                    //Elimina al equipo
                    await deleteDoc(doc(db, 'equipos', id));
                }

                //Elimina los datos del entrenador en firestore
                const entrenador = await getItemsDT(email);
                await deleteDoc(doc(db, 'entrenadores', entrenador.id));

                //Eliminar la cuenta del usuario
                await deleteUser(auth.currentUser);

                // Recargar la página después de que la tarea haya completado con éxito
                //window.location.reload();

            } catch (error) {
                console.log(error);
                alert("Error al reautenticar el usuario. Asegúrate de que la contraseña sea correcta.");
            }
        }
    };

    const handleEditMode = () => {
        setEditMode(!editMode);
    };

    const handleEdit = (key, value) => {
        setEditedData({ ...editedData, [key]: value });
    };

    const saveChanges = async () => {
        try {
            if (lista.length > 0) {
                //const id = lista[0].id;
                console.log("editedData:", editedData);
                await updateDoc(doc(db, 'entrenadores', usuario), editedData);
                setEditMode(false);
            } else {
                console.log('No hay elementos en la lista');
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        onAuthStateChanged(auth, async (usuarioFirebase) => {
            if (usuarioFirebase) {
                const entrenadorA = await getItemsDT(usuarioFirebase.email);
                setUsuario(entrenadorA.id);
                setEmail(usuarioFirebase.email);
                setEquipo(entrenadorA.equipo);
                if (entrenadorA.id) {
                    setUsuario(entrenadorA.id)
                    const docSnapshot = await getDoc(doc(db, 'entrenadores', entrenadorA.id));
                    if (docSnapshot.exists()) {
                        setLista([docSnapshot.data()]);
                    } else {
                        console.log('El documento no existe.');
                    }
                }
            } else {
                setUsuario(null);
            }
        });
    }, [editMode]);


    // Lista de países
    const paises = [
        '',
        'Afganistán',
        'Albania',
        'Alemania',
        'Andorra',
        'Angola',
        'Antigua y Barbuda',
        'Arabia Saudita',
        'Argelia',
        'Argentina',
        'Armenia',
        'Australia',
        'Austria',
        'Azerbaiyán',
        'Bahamas',
        'Bangladés',
        'Barbados',
        'Baréin',
        'Bélgica',
        'Belice',
        'Benín',
        'Bielorrusia',
        'Birmania',
        'Bolivia',
        'Bosnia y Herzegovina',
        'Botsuana',
        'Brasil',
        'Brunéi',
        'Bulgaria',
        'Burkina Faso',
        'Burundi',
        'Bután',
        'Cabo Verde',
        'Camboya',
        'Camerún',
        'Canadá',
        'Catar',
        'Chad',
        'Chile',
        'China',
        'Chipre',
        'Ciudad del Vaticano',
        'Colombia',
        'Comoras',
        'Corea del Norte',
        'Corea del Sur',
        'Costa de Marfil',
        'Costa Rica',
        'Croacia',
        'Cuba',
        'Dinamarca',
        'Dominica',
        'Ecuador',
        'Egipto',
        'El Salvador',
        'Emiratos Árabes Unidos',
        'Eritrea',
        'Eslovaquia',
        'Eslovenia',
        'España',
        'Estados Unidos',
        'Estonia',
        'Etiopía',
        'Filipinas',
        'Finlandia',
        'Fiyi',
        'Francia',
        'Gabón',
        'Gambia',
        'Georgia',
        'Ghana',
        'Granada',
        'Grecia',
        'Guatemala',
        'Guyana',
        'Guinea',
        'Guinea ecuatorial',
        'Guinea-Bisáu',
        'Haití',
        'Honduras',
        'Hungría',
        'India',
        'Indonesia',
        'Irak',
        'Irán',
        'Irlanda',
        'Islandia',
        'Islas Marshall',
        'Islas Salomón',
        'Israel',
        'Italia',
        'Jamaica',
        'Japón',
        'Jordania',
        'Kazajistán',
        'Kenia',
        'Kirguistán',
        'Kiribati',
        'Kuwait',
        'Laos',
        'Lesoto',
        'Letonia',
        'Líbano',
        'Liberia',
        'Libia',
        'Liechtenstein',
        'Lituania',
        'Luxemburgo',
        'Macedonia del Norte',
        'Madagascar',
        'Malasia',
        'Malaui',
        'Maldivas',
        'Malí',
        'Malta',
        'Marruecos',
        'Mauricio',
        'Mauritania',
        'México',
        'Micronesia',
        'Moldavia',
        'Mónaco',
        'Mongolia',
        'Montenegro',
        'Mozambique',
        'Namibia',
        'Nauru',
        'Nepal',
        'Nicaragua',
        'Níger',
        'Nigeria',
        'Noruega',
        'Nueva Zelanda',
        'Omán',
        'Países Bajos',
        'Pakistán',
        'Palaos',
        'Panamá',
        'Papúa Nueva Guinea',
        'Paraguay',
        'Perú',
        'Polonia',
        'Portugal',
        'Reino Unido',
        'República Centroafricana',
        'República Checa',
        'República del Congo',
        'República Democrática del Congo',
        'República Dominicana',
        'Ruanda',
        'Rumania',
        'Rusia',
        'Samoa',
        'San Cristóbal y Nieves',
        'San Marino',
        'San Vicente y las Granadinas',
        'Santa Lucía',
        'Santo Tomé y Príncipe',
        'Senegal',
        'Serbia',
        'Seychelles',
        'Sierra Leona',
        'Singapur',
        'Siria',
        'Somalia',
        'Sri Lanka',
        'Suazilandia',
        'Sudáfrica',
        'Sudán',
        'Sudán del Sur',
        'Suecia',
        'Suiza',
        'Surinam',
        'Tailandia',
        'Tanzania',
        'Tayikistán',
        'Timor Oriental',
        'Togo',
        'Tonga',
        'Trinidad y Tobago',
        'Túnez',
        'Turkmenistán',
        'Turquía',
        'Tuvalu',
        'Ucrania',
        'Uganda',
        'Uruguay',
        'Uzbekistán',
        'Vanuatu',
        'Venezuela',
        'Vietnam',
        'Yemen',
        'Yibuti',
        'Zambia',
        'Zimbabue'
    ];

    return (
        <div>
            <MenuHorizontal />
            <h2 className='text-center'>Perfil</h2>
            <div className='card-body'>
                <div>
                    <table className='table'>
                        <tbody>
                            <div className='vertical-table-container'>
                                {lista.map(list => (
                                    <div key={list.id} className='vertical-row'>
                                        <div>
                                            Nombre: {editMode ? (
                                                <input
                                                    type="text"
                                                    className='caja-textorg'
                                                    value={editedData.nombre}
                                                    onChange={(e) => handleEdit("nombre", e.target.value)}
                                                />
                                            ) : (
                                                list.nombre
                                            )}
                                        </div>
                                        <div>
                                            Apellido: {editMode ? (
                                                <input
                                                    type="text"
                                                    className='caja-textorg'
                                                    value={editedData.apellidos}
                                                    onChange={(e) => handleEdit("apellidos", e.target.value)}
                                                />
                                            ) : (
                                                list.apellidos
                                            )}
                                        </div>
                                        <div>
                                            Edad: {editMode ? (
                                                <input
                                                    type="number"
                                                    className='caja-textorg'
                                                    value={editedData.edad}
                                                    onChange={(e) => handleEdit("edad", e.target.value.toString())} // Convertir a String utilizando toString()
                                                />
                                            ) : (
                                                list.edad
                                            )}
                                        </div>

                                        <div>
                                            País: {editMode ? (
                                                <select value={editedData.nacionalidad} onChange={(e) => handleEdit("nacionalidad", e.target.value)}>
                                                    {paises.map((pais, index) => (
                                                        <option key={index} value={pais}>
                                                            {pais}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                list.nacionalidad
                                            )}
                                        </div>

                                        <div>
                                            Correo: {list.email}
                                        </div>
                                        <div className='button-container'>
                                            {editMode ? (
                                                <>
                                                    <button className='btn btn-success' onClick={saveChanges}>Guardar cambios</button>
                                                    <button className='btn btn-secondary' onClick={handleEditMode}>Cancelar</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className='btn btn-primary' onClick={handleEditMode}>Editar perfil</button>
                                                    <NavLink to="ChangePassword"><button className='btn btn-info'>Cambiar contraseña</button></NavLink>
                                                    <button className='btn btn-danger' onClick={() => eliminarPerfil(equipo)}>Eliminar cuenta</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default PerfilDT;
