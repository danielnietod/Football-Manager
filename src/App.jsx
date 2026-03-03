import { useEffect, useState } from 'react';
import './App.css';
import { appFirebase, db } from './Firebase/firebaseConfiguration';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import RegisterDT from './Components/RegisterDT';
import RegisterPL from './Components/RegisterPL';
import Login from './Components/Login';
import HomeDT from './Components/HomeDT';
import HomePL from './Components/HomePL';
import { collection, getDocs, query, where } from 'firebase/firestore';
import EquipoDT from './Components/EquipoDT';
import SinEquipoDT from './Components/SinEquipoDT';
import CrearEquipoDT from './Components/CrearEquipoDT';
import PartidosDT from './Components/PartidosDT';
import EntrenamientosDT from './Components/EntrenamientosDT';
import CrearPartidoDT from './Components/CrearPartido';
import CrearEntrenamientoDT from './Components/CrearEntrenamientoDT';
import JugadoresDT from './Components/JugadoresDT';
import AgregarJugadoresDT from './Components/AgregarJugadoresDT';
import EstadisticasDT from './Components/EstadisticasDT';
import PerfilDT from './Components/PerfilDT';
import ChangePassword from './Components/ChangePassword';
import EquipoPL from './Components/EquipoPL';
import SinEquipoPL from './Components/SinEquipoPL';
import PartidosPL from './Components/PartidosPL';
import EntrenamientosPL from './Components/EntrenamientosPL';
import EstadisticasPL from './Components/EstadisticasPL';
import PerfilPL from './Components/PerfilPL';

const auth = getAuth(appFirebase);

const getArrayFromCollection = (collection) => {
  return collection.docs.map(doc => {
    return { ...doc.data(), id: doc.id };
  });
}

//Función que verifica si el correo ingresado es de un Entrenador
const getItemsByConditionDT = async (value) => {
  const colRef = collection(db, "entrenadores");
  const result = await getDocs(query(colRef, where('email', '==', value)));
  const correo = getArrayFromCollection(result)
  return correo[0]
}

//Función que verifica si el correo ingresado es de un Jugador
const getItemsByConditionPL = async (value) => {
  const colRef = collection(db, "jugadores");
  const result = await getDocs(query(colRef, where('email', '==', value)));
  const correo = getArrayFromCollection(result)
  return correo[0]
}

//Función que verifica si el Entrenador tiene un equipo creadp
// const getEquipoDT = async (value) => {
//   const colRef = collection(db, "entrenadores");
//   const result = await getDocs(query(colRef, where('email', '==', value)));
//   const correo = getArrayFromCollection(result)
//   console.log(correo[0].equipo)
//   return correo[0].equipo
// }

function App() {
  const [usuario, setUsuario] = useState(null);
  const [userType, setUserType] = useState(null);
  const [equipoCreado, setEquipoCreado] = useState("");
  const [equipoPL, setEquipoPL] = useState("");

  // Definimos la cantidad de tiempo de inactividad en milisegundos
  const TIEMPO_INACTIVIDAD = 30 * 60 * 1000; // 30 minutos

  useEffect(() => {
    console.log("Se ejecuta en App")
    onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario(usuarioFirebase);
        //Verificamos si el correo ingresado es de un Entrenador
        getItemsByConditionDT(usuarioFirebase.email)
          .then(resultadoE => {
            console.log("resultadoE.email: "+resultadoE.email);
            if (resultadoE.email === usuarioFirebase.email) {
              setUserType("entrenador")
              //Verificamos si el Entrenador tiene equipo creado
              if (resultadoE.equipo != '') {
                setEquipoCreado(resultadoE.equipo)
              }
              else{
                setEquipoCreado('')
              }
            }
          })
          .catch(error => {
            console.error(error); // Manejo de errores
          });

        //Verificamos si el correo ingresado es de un Jugador
        getItemsByConditionPL(usuarioFirebase.email)
          .then(resultadoJ => {
            console.log(resultadoJ);
            if (resultadoJ.email === usuarioFirebase.email) {
              setUserType("jugador")
              //Verificamos si el Jugador esta en un equipo
              console.log(resultadoJ.equipo)
              if (resultadoJ.equipo != '') {
                setEquipoPL(resultadoJ.equipo)
              }
              else{
                setEquipoPL('')
              }
            }
          })
          .catch(error => {
            console.error(error); // Manejo de errores
          });



      } else {
        setUsuario(null);
      }
    });

  }, [auth]);


  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={usuario ? (userType === "entrenador" ? <HomeDT/> : <HomePL/>) : <Login />} />
        <Route path="/RegisterDT" element={<RegisterDT />} />
        <Route path="/RegisterPL" element={<RegisterPL />} />
        <Route path="/Equipo" element={usuario ? (userType === "entrenador" ? (equipoCreado !== "" ? <EquipoDT /> : <SinEquipoDT />) : (equipoPL !== "" ? <EquipoPL /> : <SinEquipoPL />)) : <Login />} />
        <Route path="/Equipo/CrearEquipoDT" element={usuario && userType === "entrenador" ? <CrearEquipoDT /> : <Login />} />
        <Route path="/Equipo/EditarEquipoDT/:id" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <CrearEquipoDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Partidos" element={usuario ? (userType === "entrenador" ? (equipoCreado !== "" ? <PartidosDT /> : <SinEquipoDT />) : (equipoPL !== "" ? <PartidosPL /> : <SinEquipoPL />)) : <Login />} />
        <Route path="/Equipo/Entrenamientos" element={usuario ? (userType === "entrenador" ? (equipoCreado !== "" ? <EntrenamientosDT /> : <SinEquipoDT />) : (equipoPL !== "" ? <EntrenamientosPL /> : <SinEquipoPL />)) : <Login />} />
        <Route path="/Equipo/Partidos/CrearPartidoDT" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <CrearPartidoDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Partidos/EditarPartidoDT/:id" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <CrearPartidoDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Entrenamientos/CrearEntrenamientoDT" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <CrearEntrenamientoDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Entrenamientos/EditarEntrenamientoDT/:id" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <CrearEntrenamientoDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Jugadores" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <JugadoresDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Jugadores/AgregarJugadoresDT" element={usuario && userType === "entrenador" ? (equipoCreado !== "" ? <AgregarJugadoresDT /> : <SinEquipoDT />) : <Login />} />
        <Route path="/Equipo/Estadisticas" element={usuario ? (userType === "entrenador" ? (equipoCreado !== "" ? <EstadisticasDT /> : <SinEquipoDT />) : (equipoPL !== "" ? <EstadisticasPL /> : <SinEquipoPL />)) : <Login />} />
        <Route path="/Perfil" element={usuario ? (userType === "entrenador" ? <PerfilDT /> : <PerfilPL />) : <Login />} />
        <Route path="/Perfil/ChangePassword" element={usuario ? <ChangePassword /> : <Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

