import React, { useState } from 'react';
import Imagen2 from "../assets/futboluser.png";
import { NavLink } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { appFirebase } from '../Firebase/firebaseConfiguration';

const auth = getAuth(appFirebase);

const Login = () => {
    const [alerta, setAlerta] = useState(""); // Estado para manejar la alerta

    const funcInicioSesion = async (e) => {
        e.preventDefault();
        const correo = e.target.email.value;
        const contrasena = e.target.password.value;

        try {
            await signInWithEmailAndPassword(auth, correo, contrasena);
        } catch (error) {
            // Manejo de errores
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
                setAlerta("Correo electrónico o contraseña incorrectos.");
                console.log(error) 
            } else {
                setAlerta("Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.");
                console.log(error)
            }
        }
    };

    return (
        <div className='container'>
            <div className="row">
                <div className="col">
                    <div className="padre">
                        <div className="card card-body shadow-lg">
                            <img src={Imagen2} alt="" className='estilo-profile' />
                            <form onSubmit={funcInicioSesion}>
                                <input type="text" placeholder='Ingresar email' className='caja-texto' id='email' />
                                <input type="password" placeholder='Ingresar contraseña' className='caja-texto' id='password' />
                                <button className='btnform'>Iniciar sesión</button>
                            </form>
                            {alerta && <div className="alert alert-danger" role="alert">{alerta}</div>}
                            <h4 className='links'>
                                <p>¿No tienes cuenta?</p>
                               
                                    <NavLink to="/RegisterDT">Regístrate como entrenador</NavLink><br />
                                    <NavLink to="/RegisterPL">Regístrate como jugador</NavLink><br />
                            </h4>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Login;
