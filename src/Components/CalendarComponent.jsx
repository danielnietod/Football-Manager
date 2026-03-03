import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { appFirebase, db } from '../Firebase/firebaseConfiguration';

const auth = getAuth(appFirebase);

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [usuario, setUsuario] = useState(null);

  //Función que regresa el id del equipo de un Usuario
  const getEquipo = async (value) => {
    const colRef = collection(db, "entrenadores");
    const result = await getDocs(query(colRef, where('email', '==', value)));
    if(result.empty){
      const colRef = collection(db, "jugadores");
      const result = await getDocs(query(colRef, where('email', '==', value)));
      const correo = result.docs.map(doc => doc.data());
      return correo[0].equipo;
    }
    else{
      const correo = result.docs.map(doc => doc.data());
      return correo[0].equipo;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        onAuthStateChanged(auth, async (usuarioFirebase) => {
          if (usuarioFirebase) {
            setUsuario(usuarioFirebase)

            //Obtenemos el id del equipo
            const equipoId = await getEquipo(usuarioFirebase.email);
            console.log(equipoId)

            if (equipoId != "") {
              console.log("Equipo CALENDARIO: " + equipoId)
              const partidosSnapshot = await getDocs(query(collection(db, 'partidos'), where('equipo', '==', equipoId)));
              const entrenamientosSnapshot = await getDocs(query(collection(db, 'entrenamientos'), where('equipo', '==', equipoId)));

              const partidosEvents = partidosSnapshot.docs.map(doc => ({
                title: `.vs ${doc.data().rival}`,
                start: doc.data().fecha
              }));

              const entrenamientosEvents = entrenamientosSnapshot.docs.map(doc => ({
                title: "Entrenamiento",
                start: doc.data().fecha
              }));

              console.log("Partidos Events:", partidosEvents);
              console.log("Entrenamientos Events:", entrenamientosEvents);

              setEvents([...partidosEvents, ...entrenamientosEvents]);
            }
          } else {
            setUsuario(null);
          }
        });

      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchData();
  }, [usuario]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
    />
  );
}

export default CalendarComponent;
