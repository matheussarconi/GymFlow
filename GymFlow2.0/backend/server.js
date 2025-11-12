// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connection = require('./db_config');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());

// Servir imagens estáticas da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 3030;
const jwtSecret = process.env.JWT_SECRET || 'senhajwt';

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuração de armazenamento para fotos de perfil
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'profilePictures');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
};

const uploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('profilePicture');

// -------------------- AUTENTICAÇÃO --------------------
app.post('/register', uploadProfilePicture, async (req, res) => {
  try {
    const { nome_usuario, email, password } = req.body;

    if (!nome_usuario || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePictureUrl = req.file ? `/uploads/profilePictures/${req.file.filename}` : null;

    const [result] = await connection.execute(
      'INSERT INTO users (userName, email, password, profilePictureUrl) VALUES (?, ?, ?, ?)',
      [nome_usuario, email, hashedPassword, profilePictureUrl]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Erro em /register:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }
    const [users] = await connection.execute(
      'SELECT id, userName, email, password, profilePictureUrl FROM users WHERE email = ? OR userName = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, userName: user.userName }, jwtSecret, { expiresIn: '14d' });
    res.json({
      success: true,
      message: 'Login bem-sucedido',
      token,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        profilePictureUrl: user.profilePictureUrl || null
      }
    });
  } catch (error) {
    console.error('Erro em /login:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});


// -------------------- TREINOS / WORKOUTS --------------------

// Criar novo treino (academia ou cardio)
app.post('/createWorkout', async (req, res) => {
  try {
    const { nomeTreino, tipoTreino, userId } = req.body;
    if (!nomeTreino || !tipoTreino || !userId) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    if (!['academia', 'cardio'].includes(tipoTreino)) {
      return res.status(400).json({ success: false, message: 'Tipo de treino inválido' });
    }

    let workoutId;
    if (tipoTreino === 'academia') {
      const [result] = await connection.execute(
        'INSERT INTO gymWorkouts (userId, workoutName) VALUES (?, ?)',
        [userId, nomeTreino]
      );
      workoutId = result.insertId;
    } else {
      const [result] = await connection.execute(
        'INSERT INTO cardioWorkouts (userId, workoutName) VALUES (?, ?)',
        [userId, nomeTreino]
      );
      workoutId = result.insertId;
    }

    res.status(201).json({ success: true, message: 'Plano de treino criado com sucesso', workoutId });
  } catch (error) {
    console.error('Erro em /createWorkout:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

//Lista os treinos
app.get('/viewWorkouts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
    }

    const [gymWorkouts] = await connection.execute(
      'SELECT gymWorkoutId as id, workoutName, "academia" as tipo FROM gymWorkouts WHERE userId = ?',
      [userId]
    );

    const [cardioWorkouts] = await connection.execute(
      'SELECT cardioWorkoutId as id, workoutName, "cardio" as tipo FROM cardioWorkouts WHERE userId = ?',
      [userId]
    );

    res.json({ success: true, workouts: [...gymWorkouts, ...cardioWorkouts] });
  } catch (error) {
    console.error('Erro em /viewWorkouts:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Atualiza o treino
app.put('/updateWorkout/:workoutId', async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { workoutName, tipoTreino } = req.body;

    if (!workoutName || !tipoTreino) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios' });
    }

    if (!['academia', 'cardio'].includes(tipoTreino)) {
      return res.status(400).json({ success: false, message: 'Tipo de treino inválido' });
    }

    const table = tipoTreino === 'academia' ? 'gymWorkouts' : 'cardioWorkouts';
    const idField = tipoTreino === 'academia' ? 'gymWorkoutId' : 'cardioWorkoutId';

    const [result] = await connection.execute(
      `UPDATE ${table} SET workoutName = ? WHERE ${idField} = ?`,
      [workoutName, workoutId]
    );

    res.json({ success: true, message: 'Treino atualizado', result });
  } catch (error) {
    console.error('Erro em /updateWorkout:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Deletar treino inteiro (exclui exercícios vinculados e depois o treino)
app.delete('/deleteWorkout/:workoutId/:tipoTreino', async (req, res) => {
  try {
    const { workoutId, tipoTreino } = req.params;

    if (!['academia', 'cardio'].includes(tipoTreino)) {
      return res.status(400).json({ success: false, message: 'Tipo de treino inválido' });
    }
    if (tipoTreino === 'academia') {
      await connection.execute('DELETE FROM gymWorkoutExercises WHERE gymWorkoutId = ?', [workoutId]);
    } else {
      await connection.execute('DELETE FROM cardioExercises WHERE cardioWorkoutId = ?', [workoutId]);
    }
    const table = tipoTreino === 'academia' ? 'gymWorkouts' : 'cardioWorkouts';
    const idField = tipoTreino === 'academia' ? 'gymWorkoutId' : 'cardioWorkoutId';

    const [result] = await connection.execute(`DELETE FROM ${table} WHERE ${idField} = ?`, [workoutId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Treino não encontrado' });
    }

    res.json({ success: true, message: 'Treino e exercícios excluídos com sucesso' });
  } catch (error) {
    console.error('Erro em /deleteWorkout:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// -------------------- EXERCÍCIOS --------------------

// Busca todos os exercícios
app.get('/exercicios', async (req, res) => {
  try {
    console.log('Buscando exercícios da tabela exercises...');
    const [exercicios] = await connection.execute(
      'SELECT exerciseId as id_exer, exerciseName as nomeExer, exercisePhoto as foto_exer FROM exercises ORDER BY exerciseName ASC'
    );

    const exerciciosFormatados = exercicios.map(ex => ({
      ...ex,
      foto_exer: ex.foto_exer ? ex.foto_exer.replace('/server', '') : null
    }));

    console.log('Total de exercícios encontrados:', exerciciosFormatados.length);
    res.json(exerciciosFormatados);
  } catch (error) {
    console.error('Erro em /exercicios:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Adicionar exercício no treino
app.post('/addExerciseToWorkout', async (req, res) => {
  try {
    console.log('Recebendo requisição para adicionar exercício...', req.body);
    let { workoutId, workoutType, exerciseId, userId } = req.body;

    workoutId = parseInt(workoutId);
    exerciseId = parseInt(exerciseId);
    userId = parseInt(userId);

    if (!workoutId || !workoutType || !exerciseId || !userId) {
      return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }

    if (!['academia', 'cardio'].includes(workoutType)) {
      return res.status(400).json({ success: false, message: 'Tipo de treino inválido' });
    }

    if (workoutType === 'academia') {
      const [existing] = await connection.execute(
        'SELECT * FROM gymWorkoutExercises WHERE gymWorkoutId = ? AND exerciseId = ?',
        [workoutId, exerciseId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Exercício já adicionado a este treino' });
      }

      await connection.execute(
        `INSERT INTO gymWorkoutExercises (gymWorkoutId, exerciseId, userGymWorkoutId)
         VALUES (?, ?, ?)`,
        [workoutId, exerciseId, userId]
      );
    } else {
      const [existing] = await connection.execute(
        'SELECT * FROM cardioExercises WHERE cardioWorkoutId = ? AND exerciseId = ?',
        [workoutId, exerciseId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Exercício já adicionado a este treino' });
      }

      await connection.execute(
        'INSERT INTO cardioExercises (cardioWorkoutId, exerciseId) VALUES (?, ?)',
        [workoutId, exerciseId]
      );
    }

    res.status(201).json({ success: true, message: 'Exercício adicionado ao treino com sucesso' });
  } catch (error) {
    console.error('Erro em /addExerciseToWorkout:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Buscar exercícios de um treino específico
app.get('/workoutExercises/:workoutId/:workoutType', async (req, res) => {
  try {
    const { workoutId, workoutType } = req.params;
    console.log(`Buscando exercícios - WorkoutID: ${workoutId}, Tipo: ${workoutType}`);

    if (!workoutId || !workoutType) {
      return res.status(400).json({ success: false, message: 'Parâmetros inválidos' });
    }

    if (!['academia', 'cardio'].includes(workoutType)) {
      return res.status(400).json({ success: false, message: 'Tipo de treino inválido' });
    }

    let rows = [];
    if (workoutType === 'academia') {
      [rows] = await connection.execute(
        `SELECT 
          gwe.gymWorkoutExerciseId,
          gwe.usedWeight,
          gwe.reps,
          gwe.sets,
          e.exerciseId,
          e.exerciseName,
          e.exercisePhoto
        FROM gymWorkoutExercises gwe
        INNER JOIN exercises e ON gwe.exerciseId = e.exerciseId
        WHERE gwe.gymWorkoutId = ?
        ORDER BY gwe.gymWorkoutExerciseId DESC`,
        [workoutId]
      );
    } else {
      [rows] = await connection.execute(
        `SELECT 
          ce.cardioExerciseId,
          ce.description,
          ce.distance,
          ce.type,
          e.exerciseId,
          e.exerciseName,
          e.exercisePhoto
        FROM cardioExercises ce
        INNER JOIN exercises e ON ce.exerciseId = e.exerciseId
        WHERE ce.cardioWorkoutId = ?
        ORDER BY ce.cardioExerciseId DESC`,
        [workoutId]
      );
    }

    const exercisesFormatted = rows.map(ex => ({
      ...ex,
      exercisePhoto: ex.exercisePhoto ? ex.exercisePhoto.replace('/server', '') : null
    }));

    res.json({ success: true, exercises: exercisesFormatted });
  } catch (error) {
    console.error('Erro em /workoutExercises:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor', error: error.message });
  }
});

// Atualizar detalhes de um exercício (peso, reps, sets)
app.post('/updateExerciseDetails', async (req, res) => {
  try {
    const { gymWorkoutExerciseId, weight, reps, sets } = req.body;

    console.log('Recebendo dados para atualizar:', { gymWorkoutExerciseId, weight, reps, sets });

    if (!gymWorkoutExerciseId) {
      return res.status(400).json({ success: false, message: 'ID do exercício é obrigatório' });
    }

    const usedWeight = parseFloat(weight);
    const numReps = parseInt(reps);
    const numSets = parseInt(sets);

    if (isNaN(usedWeight) || isNaN(numReps) || isNaN(numSets)) {
      return res.status(400).json({ success: false, message: 'Peso, reps e sets precisam ser numéricos' });
    }

    const [existing] = await connection.execute(
      'SELECT * FROM gymWorkoutExercises WHERE gymWorkoutExerciseId = ?',
      [gymWorkoutExerciseId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    }

    const [result] = await connection.execute(
      `UPDATE gymWorkoutExercises 
       SET usedWeight = ?, reps = ?, sets = ?
       WHERE gymWorkoutExerciseId = ?`,
      [usedWeight, numReps, numSets, gymWorkoutExerciseId]
    );

    res.json({ success: true, message: 'Detalhes atualizados com sucesso', affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Erro em /updateExerciseDetails:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Deletar exercício (academia ou cardio) por ID específico da tabela
app.delete('/deleteExercise/:exerciseUniqueId/:tipoTreino', async (req, res) => {
  try {
    const { exerciseUniqueId, tipoTreino } = req.params;
    console.log('Deletando exercício:', { exerciseUniqueId, tipoTreino });

    if (!['academia', 'cardio'].includes(tipoTreino)) {
      return res.status(400).json({ success: false, message: 'Tipo de treino inválido' });
    }

    const table = tipoTreino === 'academia' ? 'gymWorkoutExercises' : 'cardioExercises';
    const idField = tipoTreino === 'academia' ? 'gymWorkoutExerciseId' : 'cardioExerciseId';

    const [result] = await connection.execute(`DELETE FROM ${table} WHERE ${idField} = ?`, [exerciseUniqueId]);

    console.log('Linhas afetadas:', result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Exercício não encontrado' });
    }

    res.json({ success: true, message: 'Exercício removido com sucesso' });
  } catch (error) {
    console.error('Erro em /deleteExercise:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});
app.post('/addPoint', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId é obrigatório' });

    // Verifica se o usuário já tem registro na tabela points
    const [existing] = await connection.execute('SELECT points FROM points WHERE userId = ?', [userId]);
    if (existing.length > 0) {
      await connection.execute('UPDATE points SET points = points + 1 WHERE userId = ?', [userId]);
    } else {
      await connection.execute('INSERT INTO points (userId, points) VALUES (?, 1)', [userId]);
    }

    res.json({ success: true, message: 'Ponto adicionado!' });
  } catch (error) {
    console.error('Erro em /addPoint:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});


app.get('/ranking', async (req, res) => {
  try {
    // Busca os pontos de todos os usuários com informações do perfil
    const [rows] = await connection.execute(`
      SELECT 
        u.id,
        u.userName,
        u.profilePictureUrl,
        COALESCE(p.points, 0) as points
      FROM users u
      LEFT JOIN points p ON u.id = p.userId
      ORDER BY points DESC, u.userName ASC
      LIMIT 100
    `);

    // Formata os dados com posição no ranking
    const ranking = rows.map((user, index) => ({
      position: index + 1,
      userId: user.id,
      userName: user.userName,
      profilePictureUrl: user.profilePictureUrl,
      points: user.points
    }));

    res.json({ 
      success: true, 
      ranking: ranking,
      total: ranking.length
    });
  } catch (error) {
    console.error('Erro em /ranking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar ranking',
      error: error.message 
    });
  }
});

//-------------------EDIT PROFILE------------------------

//PEGA OS DADOS DO USUÁRIO  
app.get('/getDataEditUsers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await connection.execute(
      'SELECT id, userName, email, profilePictureUrl FROM users WHERE id = ?',
      [id]
    );
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Erro em /getDataEditUsers:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

//EDITA OS DADOS DO USUÁRIO
app.put('/editusers/:id', uploadProfilePicture, async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, password } = req.body;

    const [users] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    const updates = [];
    const values = [];

    if (userName) {
      updates.push('userName = ?');
      values.push(userName);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashed);
    }
    if (req.file) {
      const profileUrl = `/uploads/profilePictures/${req.file.filename}`;
      updates.push('profilePictureUrl = ?');
      values.push(profileUrl);
    }

    if (updates.length === 0)
      return res.status(400).json({ success: false, message: 'Nenhuma alteração enviada' });

    values.push(id);
    await connection.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro em /editusers/:id PUT:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
  }
});

// --- DELETE EXCLUIR ---
app.delete('/deleteUsers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro em DELETE /deleteusers/:id:', error);
    res.status(500).json({ success: false, message: 'Erro ao deletar usuário' });
  }
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));