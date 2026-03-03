import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { appFirebase } from '../Firebase/firebaseConfiguration';


const auth = getAuth(appFirebase);



const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleChangePassword = async () => {

        try {
            //Reautenticar al usuario
            const user = auth.currentUser;

            const credential = EmailAuthProvider.credential(
                user.email,
                password
            );
            if (newPassword.length < 8) {
                setError("La contraseña debe ser de al menos 8 caracteres.");
                return;
            }

            if (newPassword == confirmNewPassword) {
                await reauthenticateWithCredential(user, credential);

                //Actualizar la contraseña
                await updatePassword(user, newPassword);
                setPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setError(null);
                alert('¡Contraseña actualizada con éxito!');

                //Regresar al componente PerfilDT
                navigate("/Perfil");
            }
            else{
                setError("Las contraseñas no coinciden.");
            }
        } catch (error) {
            setError("Contraseña actual incorrecta.");
            console.log(error.message)
        }
    };

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    <div className='padre'>
                        <div className='card card-body shadow-lg'>
                            <h2>Cambiar contraseña</h2><br />
                            {error && <div style={{ color: 'red' }}>{error}</div>}
                            <input
                                type="password"
                                className='caja-textorg'
                                placeholder="Contraseña actual"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                className='caja-textorg'
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                className='caja-textorg'
                                placeholder="Confirmar nueva contraseña"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                            <button className='btn btn-success' onClick={handleChangePassword}>Cambiar contraseña</button>

                            <NavLink to="/Perfil"><button className='btn btn-primary'>Regresar</button></NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default ChangePassword;