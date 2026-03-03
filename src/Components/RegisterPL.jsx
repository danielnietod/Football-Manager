//Registro de entrenadores
import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { Link, NavLink, useNavigate} from 'react-router-dom';
import { collection, addDoc, and } from 'firebase/firestore';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';
import HomeDT from './HomeDT';


const auth = getAuth(appFirebase);


const RegisterPL = () => {
    const [nombre, setNombre] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [nacionalidad, setNacionalidad] = useState('');
    const [edad, setEdad] = useState('');
    const [estatura, setEstatura] = useState('');
    const [peso, setPeso] = useState('');
    const [posicion, setPosicion] = useState('');
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [alerta, setAlerta] = useState('');

    const navigate = useNavigate();

    const handleSeleccion = (event) => {
        setNacionalidad(event.target.value);
    };

    const handleSeleccionPos = (event) => {
        setPosicion(event.target.value);
    };


    const handleRegistro = async (e) => {
        e.preventDefault();
        if (contrasena.length < 8) {
            setAlerta("La contraseña debe ser de al menos 8 caracteres.");
            return;
        }
        if (contrasena !== confirmarContrasena) {
            setAlerta("Las contraseñas no coinciden.");
            return;
        }
        
        try {
            if (nombre != "" && apellidos != "" && nacionalidad != "" && edad != "" && estatura != "" && peso != "" && posicion != "") {
                // Crea el usuario con Firebase Authentication
                await createUserWithEmailAndPassword(auth, correo, contrasena)

                // Guarda los datos adicionales en Firestore
                await addDoc(collection(db, 'jugadores'), {
                    nombre: nombre,
                    apellidos: apellidos,
                    nacionalidad: nacionalidad,
                    edad: edad,
                    estatura: estatura,
                    peso: peso,
                    posicion: posicion,
                    email: correo,
                    equipo: '',
                    minutos: '',
                    goles: '',
                    asistencias: '',
                    faltas: '',
                    tAmarillas: '',
                    tRojas: ''
                });

                // Limpiar los campos después del registro exitoso
                setNombre('');
                setApellidos('');
                setEdad('');
                setNacionalidad('');
                setEstatura('');
                setPeso('');
                setPosicion('');
                setCorreo('');
                setContrasena('');
                setConfirmarContrasena('');
                setAlerta('');
                
                navigate("/");

            }
            else {
                setAlerta("Por favor, complete todos los campos.")
            }


            // Redirecciona al usuario a otra página, por ejemplo, la página principal
        } catch (error) {
            console.error('Error al registrar al usuario:', error.message);
            if(error.message === "Firebase: Error (auth/email-already-in-use)."){
                setAlerta("Este correo ya está registrado.");
            }
            else{
                setAlerta("Error al registrar el usuario.");
            }
        }
    };

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

    //Lista de posiciones
    const posiciones = [
        '',
        'Portero',
        'Defensa',
        'Mediocampista',
        'Delantero'
    ];

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='padre'>
                        <div className='card card-body shadow-lg'>
                            <h2>Crear jugador</h2><br />
                            <form onSubmit={handleRegistro}>
                                <input type="text" placeholder='Nombre' className='caja-textorg' name='nombre' value={nombre} onChange={(e) => setNombre(e.target.value)}></input>
                                <input type="text" placeholder='Apellidos' className='caja-textorg' name='apellidos' value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
                                <input type="number" placeholder='Edad' className='caja-textorg' name='edad' value={edad} onChange={(e) => setEdad(e.target.value)} />
                                <p>Nacionalidad:
                                    <select value={nacionalidad} onChange={handleSeleccion}>
                                        {paises.map((pais, index) => (
                                            <option key={index} value={pais}>
                                                {pais}
                                            </option>
                                        ))}
                                    </select>
                                </p>
                                <input type="number" placeholder='Estatura (cm)' className='caja-textorg' name='estatura' value={estatura} onChange={(e) => setEstatura(e.target.value)} />
                                <input type="number" placeholder='Peso (kg)' className='caja-textorg' name='peso' value={peso} onChange={(e) => setPeso(e.target.value)} />
                                <p>Posición:
                                    <select value={posicion} onChange={handleSeleccionPos}>
                                        {posiciones.map((pos, index) => (
                                            <option key={index} value={pos}>
                                                {pos}
                                            </option>
                                        ))}
                                    </select>
                                </p>
                                <input type="text" placeholder='Ingresar email' className='caja-textorg' name='correo' value={correo} onChange={(e) => setCorreo(e.target.value)} />
                                <input type="password" placeholder='Ingresar contraseña' className='caja-textorg' name='contrasena' value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                                <input type="password" placeholder='Confirmar contraseña' className='caja-textorg' value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} />
                                <button className='btnform'>Registrarse</button>
                            </form>
                            {alerta && <div className="alert alert-danger" role="alert">{alerta}</div>}
                            <NavLink to="/"><button className='btn btn-primary'>Regresar</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RegisterPL
