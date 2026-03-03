//Creación de equipos
import React, { useState, useEffect } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, and, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

import HomeDT from './HomeDT';

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase)

const CrearEntrenamientoDT = () => {

    const [usuario, setUsuario] = useState(null);
    const [equipo, setEquipo] = useState('');

    const valorInicial = {
        fecha: '',
        hora: '',
    }

    const [entrenamiento, setEntrenamiento] = useState(valorInicial);


    let { id } = useParams();
    if (id !== undefined) {
        console.log("Has accedido para editar entrenamiento con el id: " + id)
    }
    else {
        console.log("Has accedido para crear entrenamiento")
    }

    const navigate = useNavigate();

    const getArrayFromCollection = (collection) => {
        return collection.docs.map(doc => {
            return { ...doc.data(), id: doc.id };
        });
    }

    //Función que regresa el id de un equipo segun el correo de su entrenador
    const getIDEquipo = async (value) => {
        const colRef = collection(db, "equipos");
        const result = await getDocs(query(colRef, where('entrenador', '==', value)));
        const correo = getArrayFromCollection(result)
        console.log("Este es el id del equipo: " + correo[0].id)
        return correo[0].id
    }

    const getPartidos = async (equipo, fecha) => {
        // Consulta para verificar si ya existe un partido en la misma fecha y hora
        const colRef = collection(db, 'partidos');
        const q = query(colRef, where('fecha', '==', fecha), where('equipo', '==', equipo));
        const querySnapshot = await getDocs(q);
        return querySnapshot
    }

    const getEntrenamientos = async (equipo, fecha, entrenamientoId = null) => {
        // Consulta para verificar si ya existe un entrenamiento en la misma fecha y hora
        const colRef = collection(db, 'entrenamientos');
        var q = null;
        //Crear
        if (entrenamientoId === null) {
            q = query(colRef, where('fecha', '==', fecha), where('equipo', '==', equipo));
            
        }
        //Actualizar
        else{
            q = query(
                colRef, 
                where('fecha', '==', fecha), 
                where('equipo', '==', equipo),
                where('__name__', '!=', entrenamientoId) // Excluir el entrenamiento actual por ID
            );
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot
    }

    //Funcion para obtener un equipo existente, para actualizar
    const getEntrenamiento = async (id) => {
        try {
            const docRef = doc(db, "entrenamientos", id)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setEntrenamiento(docSnap.data());
            } else {
                console.log("El documento no existe");
            }
        } catch (error) {
            console.log(error)
        }
    }

    //Funcion para reflejar los valores
    const capturarInputs = (e) => {
        const { name, value } = e.target;
        setEntrenamiento({ ...entrenamiento, [name]: value });
    };

    useEffect(() => {
        onAuthStateChanged(auth, (usuarioFirebase) => {
            if (usuarioFirebase) {
                setUsuario(usuarioFirebase.email);
                console.log("Crear entrenamiento: " + usuarioFirebase.email)
                //usuarioF = usuarioFirebase.email;
                const resultado = getIDEquipo(usuario)
                    .then(resultado => {
                        console.log("Id: " + resultado)
                        setEquipo(resultado)
                    })
                    .catch(error => {
                        console.error(error); // Manejo de errores
                    });
            }
            else {
                setUsuario(null);
                console.log(usuarioFirebase)
            }

        })
    }, [usuario])

    useEffect(() => {
        if (id !== undefined) {
            console.log("Editar entrenamiento")
            getEntrenamiento(id)
        }
        else {
            console.log("Crear entrenamiento")

        }
    }, [id])

    //Funcion que se ejecuta en el formulario, para editar o crear un entrenamiento
    const handleCrearEntrenamiento = async (e) => {
        e.preventDefault();
        //Crear entrenamiento
        if (id === undefined) {
            console.log("Vas a crear entrenamiento")
            try {
                try {
                    setEquipo(await getIDEquipo(usuario))
                    console.log("Este es el equipo del entrenador: "+equipo)
                } catch (error) {
                    console.log(error)
                    
                }
                const queryPartidos = await getPartidos(equipo, entrenamiento.fecha)
                const queryEntrenamientos = await getEntrenamientos(equipo, entrenamiento.fecha)
                if (!queryPartidos.empty || !queryEntrenamientos.empty) {
                    console.log(queryPartidos)
                    alert("Ya existe un evento registrado en la misma fecha para este equipo.");
                    return;
                }
                // Guarda los datos en Firestore
                await addDoc(collection(db, 'entrenamientos'), {
                    ...entrenamiento,
                    equipo: equipo
                });

                // Limpiar los campos después del registro exitoso
                setUsuario(null);
                setEntrenamiento(valorInicial)
                //e.target.file.value = '';


                //Regresar al componente Partidos
                navigate("/Equipo/Entrenamientos");

            } catch (error) {
                console.error('Error al crear el entrenamiento:', error.message);
                alert("Error al crear el entrenamiento.");
            }
        }
        //Editar entrenamiento
        else {
            if (id) {
                setEquipo(await getIDEquipo(usuario))
                const queryPartidos = await getPartidos(equipo, entrenamiento.fecha)
                const queryEntrenamientos = await getEntrenamientos(equipo, entrenamiento.fecha, id)
                if (!queryPartidos.empty || !queryEntrenamientos.empty) {
                    console.log(queryPartidos)
                    alert("Ya existe un evento registrado en la misma fecha para este equipo.");
                    return;
                }
                const entrenamientoActualizado = { ...entrenamiento, equipo: equipo };
                await setDoc(doc(db, 'entrenamientos', id), entrenamientoActualizado);
            } else {
                console.error("El id del entrenamiento es inválido");
            }
            setEntrenamiento(valorInicial)
            id = undefined

            //Regresar al componente EquipoDT
            navigate("/Equipo/Entrenamientos");

        }

    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='padre'>
                        <div className='card card-body shadow-lg'>
                            <h2>{id !== undefined ? 'Editar entrenamiento' : "Crear entrenamiento"}</h2><br />
                            <form onSubmit={handleCrearEntrenamiento}>
                                <input type="date" placeholder='Fecha' className='caja-textorg' required name='fecha' value={entrenamiento.fecha} onChange={capturarInputs} />
                                <input type="time" placeholder='Hora' className='caja-textorg' required name='hora' value={entrenamiento.hora} onChange={capturarInputs} />
                                <button className='btnform'>{id !== undefined ? 'Actualizar' : "Crear"}</button>
                            </form>
                            <NavLink to="/Equipo/Entrenamientos"><button className='btn btn-primary'>Regresar</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrearEntrenamientoDT