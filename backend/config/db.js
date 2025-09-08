// Importamos el módulo 'mysql2/promise' que permite usar MySQL con soporte para promesas.
// Esto facilita el uso de async/await al trabajar con la base de datos.
import mysql from 'mysql2/promise';

// Creamos un "pool" (conjunto) de conexiones a la base de datos.
// Un pool permite gestionar múltiples conexiones de manera eficiente.
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// Exportamos el pool por defecto para que otros archivos puedan importarlo y usar la conexión a la base de datos.
<<<<<<< HEAD
export default pool;
=======
export default pool;
>>>>>>> 8114d6d0d961ebe802c63e4edd7b4facaeb91e12
