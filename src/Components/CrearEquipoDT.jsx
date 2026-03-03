//Creación de equipos
import React, { useState, useEffect } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, and, getDocs, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

import HomeDT from './HomeDT';

const auth = getAuth(appFirebase);
const storage = getStorage(appFirebase)

const CrearEquipoDT = () => {
    //let urlImgDesc = '';
    //let usuarioF = "";

    const [usuario, setUsuario] = useState(null);
    const [nombreEquipo, setNombreEquipo] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [urlArchivo, setUrlArchivo] = useState('');
    const [refArchivo, setRefArchivo] = useState('');

    const valorInicial = {
        nombre: '',
        direccion: '',
        telefono: '',
    }

    const [equipo, setEquipo] = useState(valorInicial);


    let { id } = useParams();
    if (id !== undefined) {
        console.log("Has accedido para editar equipo con el id: " + id)
    }
    else {
        console.log("Has accedido para crear equipo")
    }

    const navigate = useNavigate();

    const getArrayFromCollection = (collection) => {
        return collection.docs.map(doc => {
            return { ...doc.data(), id: doc.id };
        });
    }

    //Función que regresa el id de un equipo segun el correo de su entrenador
    // const getIDEquipo = async (value) => {
    //     const colRef = collection(db, "equipos");
    //     const result = await getDocs(query(colRef, where('entrenador', '==', value)));
    //     const correo = getArrayFromCollection(result)
    //     console.log("Este es el id del equipo: " + correo[0].id)
    //     return correo[0].id
    // }

    //Función que regresa el id de un entrenador segun el correo 
    const getIDEntrenador = async (value) => {
        const colRef = collection(db, "entrenadores");
        const result = await getDocs(query(colRef, where('email', '==', value)));
        const correo = getArrayFromCollection(result)
        const idDT = correo[0].id
        console.log("Este es el id del dt: " + idDT)
        return idDT
    }

    //Funcion para obtener un equipo existente, para actualizar
    const getEquipo = async (id) => {
        try {
            const docRef = doc(db, "equipos", id)
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setEquipo(docSnap.data());
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
        setEquipo({ ...equipo, [name]: value });
    };

    useEffect(() => {
        onAuthStateChanged(auth, (usuarioFirebase) => {
            if (usuarioFirebase) {
                setUsuario(usuarioFirebase.email);
                console.log("Crear equipo: " + usuarioFirebase.email)
                //Eliminar imagenes no asociadas en storage
                eliminarImagenesNoAsociadas();
                if (id !== undefined) {
                    console.log("Editar equipo")
                    getEquipo(id)
                }
                else {
                    console.log("Crear equipo")
                }
                //usuarioF = usuarioFirebase.email;
                // getIDEquipo(usuario)
                //     .then(resultado => {
                //         console.log("Id: " + resultado)
                //     })
                //     .catch(error => {
                //         console.error(error); // Manejo de errores
                //     });
            }
            else {
                setUsuario(null);
                console.log(usuarioFirebase)
            }

        })
    }, [id])

    // useEffect(() => {
    //     if (id !== undefined) {
    //         console.log("Editar equipo")
    //         getEquipo(id)
    //     }
    //     else {
    //         console.log("Crear equipo")

    //     }
    // }, [id])




    const handleCrearEquipo = async (e) => {
        e.preventDefault();
    
        if (!urlArchivo) {
            alert("Por favor, carga una imagen antes de continuar.");
            return;
        }
    
        //Crear equipo
        if (id === undefined) {
            console.log("Vas a crear equipo");
            try {
                // Guarda los datos en Firestore
                const equipoData = {
                    ...equipo,
                    escudo: urlArchivo,
                    entrenador: usuario
                };
    
                const equipoRef = await addDoc(collection(db, 'equipos'), equipoData);
    
                // Obtener el ID del equipo recién creado
                const equipoId = equipoRef.id;
    
                // Asociar el equipo al entrenador
                const entrenadorId = await getIDEntrenador(usuario);
                await updateDoc(doc(db, 'entrenadores', entrenadorId), {
                    equipo: equipoId
                });
    
                console.log("Equipo creado y asociado al entrenador correctamente");
    
                // Limpiar los campos después del registro exitoso
                setNombreEquipo('');
                setDireccion('');
                setTelefono('');
                setUsuario(null);
                setEquipo(valorInicial);
                e.target.file.value = '';

                // Regresar al componente EquipoDT
                navigate("/Equipo");

                // Recargar la página después de que la tarea haya completado con éxito
                window.location.reload();
    
            } catch (error) {
                console.error('Error al crear el equipo:', error.message);
                alert("Error al crear el equipo.");
            }
        }
        //Editar equipo
        else {
            if (id) {
                const equipoActualizado = { ...equipo, escudo: urlArchivo };
                await setDoc(doc(db, 'equipos', id), equipoActualizado);
                console.log("Equipo actualizado correctamente");
            } else {
                console.error("El id del equipo es inválido");
            }
            setEquipo(valorInicial);
            id = undefined;
    
            //Regresar al componente EquipoDT
            navigate("/Equipo");
        }
    };
        

    //Funcion para guardar archivo
    const fileHandler = async (e) => {
        //Detectar archivo
        const archivo = e.target.files[0];
        console.log("archivo: " + archivo)
        //Cargar a Storage
        const refArchivo = ref(storage, `escudos/${archivo.name}`)
        await uploadBytes(refArchivo, archivo)
        //Obtener la url de la imagen
        setUrlArchivo(await getDownloadURL(refArchivo))

        console.log("URL: " + urlArchivo)
    }

    const eliminarImagenesNoAsociadas = async () => {
        try {
            // Obtener la referencia del directorio donde están almacenadas las imágenes en Storage
            const storageRef = ref(storage, 'escudos/');
            const listaDeImagenes = await listAll(storageRef);
    
            // Obtener todas las imágenes asociadas a equipos desde Firestore
            const equiposSnapshot = await getDocs(collection(db, 'equipos'));
            const imagenesAsociadas = equiposSnapshot.docs.map(doc => doc.data().escudo);
    
            // Recorrer las imágenes en Storage
            for (const item of listaDeImagenes.items) {
                const urlImagen = await getDownloadURL(item);
    
                // Si la imagen no está asociada a ningún equipo, se elimina
                if (!imagenesAsociadas.includes(urlImagen)) {
                    await deleteObject(item);
                    console.log(`Imagen eliminada: ${urlImagen}`);
                }
            }
    
            console.log("Todas las imágenes no asociadas han sido eliminadas.");
        } catch (error) {
            console.error("Error al eliminar imágenes no asociadas:", error);
        }
    };
    

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='padre'>
                        <div className='card card-body shadow-lg'>
                            <h2>{id !== undefined ? 'Editar equipo' : "Crear equipo"}</h2><br />
                            <form onSubmit={handleCrearEquipo}>
                                <input type="text" placeholder='Nombre del equipo' className='caja-textorg' name='nombre' required value={equipo.nombre} onChange={capturarInputs}></input>
                                <input type="text" placeholder='Dirección de las instalaciones' className='caja-textorg' required name='direccion' value={equipo.direccion} onChange={capturarInputs} />
                                <input type="tel" placeholder='Telefono' className='caja-textorg' name='telefono' required value={equipo.telefono} onChange={capturarInputs} />
                                <input type="file" placeholder='Cargar imagen' id='file' className='form-control' required onChange={fileHandler} />
                                <button className='btnform'>{id !== undefined ? 'Actualizar' : "Crear"}</button>
                            </form>
                            <NavLink to="/Equipo"><button className='btn btn-primary'>Regresar</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CrearEquipoDT