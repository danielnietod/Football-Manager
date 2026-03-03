import emailjs from 'emailjs-com';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase/firebaseConfiguration';

const SERVICE_ID = 'service_big83to';
const PLAYER_TEMPLATE_ID = 'template_sp7ursm';
const USER_ID = 'U8_SvDkW3VpV-zRN6';

// Función para enviar notificación a jugadores
export const sendPlayerNotification = async (equipoId, fecha, rival) => {
    try {
        // Consulta para obtener jugadores cuyo equipo coincida con el equipoId
        const playersRef = collection(db, "jugadores");
        const q = query(playersRef, where("equipo", "==", equipoId));
        const querySnapshot = await getDocs(q);
    
        querySnapshot.forEach((doc) => {
            const jugador = doc.data();
            const email = jugador.email;  // Campo de email de jugador
            console.log(`Preparando envío a: ${email}`);
    
            // Crear parámetros para enviar el correo
            const templateParams = {
                to_name: jugador.nombre,  // Suponiendo que tienes el campo "nombre"
                email: email,
                message: `Tienes un partido el ${fecha} contra ${rival}.`,
            };
    
            // Enviar correo usando EmailJS
            emailjs.send(SERVICE_ID, PLAYER_TEMPLATE_ID, templateParams, USER_ID)
                .then((response) => {
                    console.log(`Correo enviado a ${jugador.nombre} con éxito: ${response.status}, ${response.text}`);
                }).catch((error) => {
                    console.error('Error al enviar correo:', error.text || error);
                });
        });
    } catch (error) {
        console.error('Error al enviar notificación:', error);
    }
};

export const sendPlayerNotificationTraining = async (equipoId, fecha, hora) => {
    try {
        // Consulta para obtener jugadores cuyo equipo coincida con el equipo
        const playersRef = collection(db, "jugadores");
        const q = query(playersRef, where("equipo", "==", equipoId));
        const querySnapshot = await getDocs(q);
    
        querySnapshot.forEach((doc) => {
            const jugador = doc.data();
            const email = jugador.email;  // Campo de email de jugador
            console.log(`Preparando envío a: ${email}`);
    
            // Crear parámetros para enviar el correo
            const templateParams = {
                to_name: jugador.nombre,
                email: email,
                message: `Tienes un entrenamiento el ${fecha} a las ${hora} hrs.`,
            };
    
            // Enviar correo usando EmailJS
            emailjs.send(SERVICE_ID, PLAYER_TEMPLATE_ID, templateParams, USER_ID)
                .then((response) => {
                    console.log(`Correo enviado a ${jugador.nombre} con éxito: ${response.status}, ${response.text}`);
                }).catch((error) => {
                    console.error('Error al enviar correo:', error.text || error);
                });
        });
    } catch (error) {
        console.error('Error al enviar notificación:', error);
    }
};
