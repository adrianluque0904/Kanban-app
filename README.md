# Kanban App

Tablero de tareas estilo Trello construido desde cero con MySQL, Node.js y JavaScript vanilla.

## Tecnologías

- **Base de datos:** MySQL — tablas `columnas` y `tareas` con Foreign Key 
- **Backend:** Node.js + Express — API REST con rutas GET, POST y PUT
- **Frontend:** HTML, CSS (Flexbox) y JavaScript vanilla (manipulación del DOM y Fetch API)

## Funcionalidades

- Ver todas las tareas organizadas en tres columnas: Pendiente, En Progreso y Terminado
- Crear tareas nuevas desde el formulario inferior
- Mover tareas entre columnas con los botones ‹ y › sin recargar la página
- Los cambios se guardan en MySQL en tiempo real

## Cómo ejecutarlo en local

1. Clona el repositorio
```bash
   git clone https://github.com/adrianluque0904/Kanban-app.git
   cd Kanban-app
```

2. Instala las dependencias
```bash
   npm install
```

3. Crea un archivo `.env` en la raíz con tus datos de MySQL
   DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=kanban_db
PORT=3000

4. Importa la base de datos en MySQL Workbench
```sql
   CREATE DATABASE kanban_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE kanban_db;

   CREATE TABLE columnas (
     id INT NOT NULL AUTO_INCREMENT,
     nombre VARCHAR(50) NOT NULL,
     PRIMARY KEY (id)
   );

   CREATE TABLE tareas (
     id INT NOT NULL AUTO_INCREMENT,
     titulo VARCHAR(200) NOT NULL,
     descripcion TEXT,
     fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     columna_id INT NOT NULL,
     PRIMARY KEY (id),
     CONSTRAINT fk_tarea_columna FOREIGN KEY (columna_id) REFERENCES columnas(id)
   );

   INSERT INTO columnas (nombre) VALUES ('Pendiente'), ('En Progreso'), ('Terminado');
```

5. Arranca el servidor
```bash
   node server.js
```

6. Abre el navegador en `http://localhost:3000`

## Estructura del proyecto
kanban-app/
├── public/
│ ├── index.html
│ ├── style.css
│ └── script.js
├── server.js
├── .env ← no incluido en el repo
└── package.json
