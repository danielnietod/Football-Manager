//Creación de equipos
import React, { useState, useEffect } from 'react'
import { getAuth,onAuthStateChanged } from 'firebase/auth'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, and, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import HomeDT from './HomeDT';

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase)

const CrearPartidoDT = () => {

    const [usuario, setUsuario] = useState(null);
    const [equipo, setEquipo] = useState('');

    const valorInicial = {
        rival: '',
        fecha: '',
        golesFavor: '',
        golesContra: ''
    }

    const [partido, setPartido] = useState(valorInicial);


    let { id } = useParams();
    if (id !== undefined) {
        console.log("Has accedido para editar partido con el id: " + id)
    }
    else {
        console.log("Has accedido para crear partido")
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

    //Función que regresa el id de un entrenador segun el correo 
    // const getIDEntrenador = async (value) => {
    //     const colRef = collection(db, "entrenadores");
    //     const result = await getDocs(query(colRef, where('email', '==', value)));
    //     const correo = getArrayFromCollection(result)
    //     const idDT = correo[0].id
    //     console.log("Este es el id del dt: " + idDT)
    //     return idDT
    // }

    const getPartidos = async (equipo, fecha, partidoId = null) => {
        // Consulta para verificar si ya existe un partido en la misma fecha y hora
        const colRef = collection(db, 'partidos');
        var q = null;
        //Crear
        if (partidoId === null) {
            q = query(colRef, where('fecha', '==', fecha), where('equipo', '==', equipo));
            
        }
        //Actualizar
        else{
            q = query(
                colRef, 
                where('fecha', '==', fecha), 
                where('equipo', '==', equipo),
                where('__name__', '!=', partidoId) // Excluir el partido actual por ID
            );
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot
    }

    const getEntrenamientos = async (equipo, fecha) => {
        // Consulta para verificar si ya existe un entrenamiento en la misma fecha y hora
        const colRef = collection(db, 'entrenamientos');
        const q = query(colRef, where('fecha', '==', fecha), where('equipo', '==', equipo));
        const querySnapshot = await getDocs(q);
        return querySnapshot
    }

    //Funcion para obtener un equipo existente, para actualizar
    const getPartido = async (id) => {
        try {
            const docRef = doc(db, "partidos", id)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPartido(docSnap.data());
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
        setPartido({ ...partido, [name]: value });
    };

    useEffect(() => {
        onAuthStateChanged(auth, (usuarioFirebase) => {
            if (usuarioFirebase) {
                setUsuario(usuarioFirebase.email);
                console.log("Crear partido: " + usuarioFirebase.email)
                //usuarioF = usuarioFirebase.email;
                getIDEquipo(usuario)
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
            console.log("Editar partido")
            getPartido(id)
        }
        else {
            console.log("Crear equipo")

        }
    }, [id])

    //Funcion que se ejecuta en el formulario, para editar o crear un partido
    const handleCrearPartido = async (e) => {
        e.preventDefault();
        //Crear partido
        if (id === undefined) {
            console.log("Vas a crear partido")
            try {
                try {
                    setEquipo(await getIDEquipo(usuario))
                    console.log("Este es el equipo del entrenador: "+equipo)
                } catch (error) {
                    console.log(error)
                    
                }
                //console.log("equiop: "+equipo)
                const queryPartidos = await getPartidos(equipo, partido.fecha)
                const queryEntrenamientos = await getEntrenamientos(equipo, partido.fecha)
                if (!queryPartidos.empty || !queryEntrenamientos.empty) {
                    console.log(queryPartidos)
                    alert("Ya existe un evento registrado en la misma fecha para este equipo.");
                    return;
                }
                // Guarda los datos en Firestore
                await addDoc(collection(db, 'partidos'), {
                    ...partido,
                    equipo: equipo
                });

                // Limpiar los campos después del registro exitoso
                setUsuario(null);
                setPartido(valorInicial)
                //e.target.file.value = '';

                //Regresar al componente Partidos
                navigate("/Equipo/Partidos");

            } catch (error) {
                console.error('Error al crear el partido:', error.message);
                alert("Error al crear el partido.");
            }
        }
        //Editar partidos
        else {
            if (id) {
                setEquipo(await getIDEquipo(usuario))
                const queryPartidos = await getPartidos(equipo, partido.fecha, id)
                const queryEntrenamientos = await getEntrenamientos(equipo, partido.fecha)
                if (!queryPartidos.empty || !queryEntrenamientos.empty) {
                    console.log(queryPartidos)
                    alert("Ya existe un evento registrado en la misma fecha para este equipo.");
                    return;
                }
                const partidoActualizado = { ...partido, equipo: equipo };
                await setDoc(doc(db, 'partidos', id), partidoActualizado);
            } else {
                console.error("El id del partido es inválido");
            }
            setPartido(valorInicial)
            id = undefined

            //Regresar al componente Partidos
            navigate("/Equipo/Partidos");

        }

    };


    const asignarEquipo = async (e) => {

    }

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='padre'>
                        <div className='card card-body shadow-lg'>
                            <h2>{id !== undefined ? 'Editar partido' : "Crear partido"}</h2><br />
                            <form onSubmit={handleCrearPartido}>
                                <input type="text" placeholder='Rival' className='caja-textorg' name='rival' required value={partido.rival} onChange={capturarInputs}></input>
                                <input type="date" placeholder='Fecha' className='caja-textorg' required name='fecha' value={partido.fecha} onChange={capturarInputs} />
                                <input type="num" placeholder='Goles anotados' className='caja-textorg' name='golesFavor' value={partido.golesFavor} onChange={capturarInputs} />
                                <input type="num" placeholder='Goles recibidos' className='caja-textorg' name='golesContra' value={partido.golesContra} onChange={capturarInputs} />
                                <button className='btnform'>{id !== undefined ? 'Actualizar' : "Crear"}</button>
                            </form>
                            <NavLink to="/Equipo/Partidos"><button className='btn btn-primary'>Regresar</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrearPartidoDT