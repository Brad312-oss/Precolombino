

// ------------------------------------------------------------
// Ruta para registrar un nuevo usuario
// ------------------------------------------------------------
router.post('/register', register);
// Llama a la función 'register' del controlador cuando se hace POST a /auth/register

// ------------------------------------------------------------
// Ruta para iniciar sesión
// ------------------------------------------------------------
router.post('/login', login);
// Llama a 'login' para verificar credenciales y devolver un token JWT

// ------------------------------------------------------------

// ------------------------------------------------------------
// Exporta el router para que pueda ser usado en la app principal
// ------------------------------------------------------------
export default router;
