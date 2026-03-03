import React, { useState } from 'react';
import { storage } from '../Firebase/firebaseConfiguration'; // Importa la configuración de Firebase

const ImageUploader = () => {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);
    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error(error);
      },
      () => {
        // La imagen se ha cargado exitosamente
        console.log('Imagen cargada exitosamente');
      }
    );
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Subir imagen</button>
    </div>
  );
};

export default ImageUploader;
