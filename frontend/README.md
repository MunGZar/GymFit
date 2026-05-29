Historias de usuarios ya terminada

HU-01: Registro de Usuarios (RF-001)
● Como: Administrador.
● Quiero: Registrar a los diferentes usuarios (Administrador,
Recepcionista, Entrenador, Socio, Prospecto).
● Para: Que cada persona tenga acceso a las funciones que le
corresponden según su rol.
● Criterios de Aceptación:
○ El sistema debe solicitar datos básicos: nombre, identificación,
correo y rol.
○ No se deben permitir correos electrónicos duplicados.
○ El sistema debe asignar automáticamente los permisos definidos
para el rol seleccionado.

HU-02: Autenticación de Usuarios (RF-002)
● Como: Usuario del sistema.
● Quiero: Iniciar sesión con mis credenciales.
● Para: Acceder de forma segura a mis funciones personales.
● Criterios de Aceptación:
○ Validación obligatoria de correo y contraseña.
○ Bloqueo temporal tras 3 intentos fallidos por seguridad.
○ Redirección automática al tablero (dashboard) correspondiente
según el rol.

HU-03: Gestión de Perfiles (RF-003)
● Como: Usuario del sistema.
● Quiero: Actualizar mis datos personales y cambiar mi contraseña.
● Para: Mantener mi información al día y mi cuenta protegida.
● Criterios de Aceptación:
○ Opción de edición para campos no críticos (teléfono, foto,
contraseña).
○ Validación de contraseña actual para permitir el cambio a una
nueva.

Bloque 2: Gestión de Prospectos y Ventas

HU-04: Captura de Prospectos (RF-004)
● Como: Recepcionista.
● Quiero: Registrar los datos de personas interesadas que aún no son
socios.
● Para: Realizar un seguimiento comercial y convertirlos en clientes.
● Criterios de Aceptación:
○ Formulario simplificado (nombre, teléfono, interés).
○ Opción de marcar el origen del contacto (redes sociales, referido,
presencial).

HU-05: Conversión de Prospecto a Socio (RF-005)
● Como: Recepcionista.
● Quiero: Convertir un perfil de Prospecto en Socio tras la compra de un
plan.
● Para: Evitar la duplicidad de datos y formalizar el ingreso del nuevo
cliente.
● Criterios de Aceptación:
○ El sistema debe migrar los datos del prospecto al módulo de
socios.
○ Se debe solicitar la información adicional requerida para socios
(dirección, datos de salud).

Bloque 3: Gestión de Planes y Membresías

HU-06: Vinculación de Planes (RF-006)
● Como: Administrador.
● Quiero: Asignar un plan de membresía a un socio registrado.
● Para: Formalizar su vinculación y establecer sus derechos de acceso.
● Criterios de Aceptación:
○ Búsqueda de socio por ID.
○ Despliegue de catálogo: Básico, Premium, VIP, Corporativo.
○ Cálculo automático de fecha de vencimiento.

HU-07: Control de Estados (RF-007)
● Como: Administrador.
● Quiero: Cambiar el estado de una membresía (activa, renovada,
cancelada o vencida).
● Para: Que el control de acceso refleje la situación real del socio.
● Criterios de Aceptación:
○ Actualización automática a "Renovada" tras pago.
○ Detección automática de "Vencida" por fecha.
○ Bloqueo de acceso inmediato si el estado no es "Activa".

Bloque 4: Gestión de Entrenamiento

HU-08: Asignación de Entrenadores (RF-008)
● Como: Administrador.
● Quiero: Vincular un entrenador a un socio o grupo.
● Para: Brindar seguimiento personalizado.
● Criterios de Aceptación:
○ Filtro para seleccionar solo personal con rol "Entrenador".
○ Opción de asignación masiva para grupos de entrenamiento.

HU-09: Evaluación Física Inicial (RF-009)
● Como: Entrenador.
● Quiero: Registrar el diagnóstico físico inicial del socio.
● Para: Diseñar rutinas basadas en la condición real del usuario.
● Criterios de Aceptación:
○ Registro de peso, medidas corporales y % de grasa.
○ Bloqueo de edición para otros usuarios que no sean el entrenador
asignado.

HU-10: Registro de Progreso (RF-010)
● Como: Entrenador.
● Quiero: Actualizar las mediciones físicas periódicamente.
● Para: Evaluar si la rutina está funcionando.
● Criterios de Aceptación:
○ Generación de historial comparativo con la evaluación inicial.
○ Visualización de gráficas de progreso para el socio.

Bloque 5: Gestión de Rutinas

HU-11: Creación de Rutinas (RF-011)
● Como: Entrenador.
● Quiero: Definir planes de ejercicio con series y repeticiones.
● Para: Tener un catálogo de entrenamiento estructurado.
● Criterios de Aceptación:
○ Inclusión de ejercicios, descansos y observaciones técnicas.
○ Almacenamiento con nombre descriptivo para reutilización.

HU-12: Asignación de Rutinas (RF-012)
● Como: Entrenador.
● Quiero: Vincular una rutina guardada a un socio.
● Para: Que el socio la consulte desde su aplicación o perfil.
● Criterios de Aceptación:
○ Notificación o reflejo inmediato en el panel del socio.

HU-13: Modificación de Rutinas (RF-013)
● Como: Entrenador.
● Quiero: Editar rutinas existentes.
● Para: Ajustarlas según la evolución del socio.
● Criterios de Aceptación:
○ Solo el personal de entrenamiento puede realizar cambios.
○ Persistencia de los cambios en el historial del socio.

Bloque 6: Gestión de Clases Grupales

HU-14: Creación de Clases (RF-014)
● Como: Administrador.  
● Quiero: Programar clases con horario, instructor y cupo.
● Para: Organizar las actividades colectivas del gimnasio.
● Criterios de Aceptación:
○ Control estricto de aforo máximo.
○ Definición de días y horas en el calendario.

HU-15: Inscripción a Clases (RF-015)
● Como: Socio.
● Quiero: Reservar mi cupo en una clase grupal.
● Para: Asegurar mi participación en la actividad elegida.
● Criterios de Aceptación:
○ Validación de membresía activa para inscribirse.
○ Descuento automático del cupo disponible.

Historias de Usuario Pendientes (Por hacer o completar integración)

Bloque 7: Control de Acceso y Asistencia

HU-16: Validación de Acceso (RF-016)
● Como: Recepcionista.
● Quiero: Verificar el estado del socio al ingresar.
● Criterios de Aceptación:
● Para: Denegar el paso a personas con membresías vencidas.
○ Respuesta visual rápida (Verde/Rojo) tras ingresar la
identificación.

HU-17: Registro de Asistencia (RF-017)
● Como: Recepcionista.
● Quiero: Guardar la marca de tiempo del ingreso del socio.
● Para: Generar estadísticas de flujo de personas.
● Criterios de Aceptación:
○ Registro automático de hora y fecha al validar el acceso.

Bloque 8: Gestión de Inventario

HU-18: Registro de Equipo (RF-018)

● Como: Administrador.
● Quiero: Catalogar las máquinas y pesas nuevas.
● Para: Mantener el inventario de activos actualizado.
● Criterios de Aceptación:
○ Categorización por tipo (Cardio/Fuerza).
○ Asignación de código de barras o ID único.

HU-19: Control de Mantenimiento (RF-019)

● Como: Administrador.
● Quiero: Programar revisiones técnicas de las máquinas.
● Para: Prevenir accidentes y daños mayores.
● Criterios de Aceptación:
○ Alerta de máquinas "Fuera de Servicio" para evitar su uso.
○ Registro de bitácora de reparaciones.

HU-20: Consulta de Disponibilidad (RF-020)
● Como: Socio.
● Quiero: Ver qué máquinas están operativas.
● Para: No perder tiempo con equipos en mantenimiento.
● Criterios de Aceptación:
○ Lista actualizada de estado de equipos en el perfil del socio.

Bloque 9: Notificaciones y Reportes

HU-21: Generación de Reportes (RF-021)
● Como: Gerente.
● Quiero: Obtener estadísticas de asistencia y ventas.
● Para: Tomar decisiones sobre promociones u horarios.
● Criterios de Aceptación:
○ Exportación a PDF y Excel.
○ Gráficos de membresías activas vs. vencidas.

HU-22: Notificaciones de Vencimiento (RF-022)
● Como: Administrador.
● Quiero: Que el sistema avise automáticamente sobre vencimientos.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
