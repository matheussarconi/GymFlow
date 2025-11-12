CREATE DATABASE gymFlow;
USE gymFlow;

-- USERS
CREATE TABLE users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(1000) NOT NULL,
    profilePictureUrl TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXERCISES
CREATE TABLE exercises(
    exerciseId INT PRIMARY KEY AUTO_INCREMENT,
    exerciseName VARCHAR(500),
    exercisePhoto VARCHAR(1000)
);

-- GYM WORKOUTS (only general workout data)
CREATE TABLE gymWorkouts (
    gymWorkoutId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    workoutName VARCHAR(120),
    workoutDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- NEW TABLE: gymWorkoutExercises (details of each exercise inside a gym workout)
CREATE TABLE gymWorkoutExercises (
    gymWorkoutExerciseId INT PRIMARY KEY AUTO_INCREMENT,
    gymWorkoutId INT,
    userGymWorkoutId INT,
    exerciseId INT,
    usedWeight FLOAT,
    reps FLOAT,
    sets FLOAT,
    FOREIGN KEY (gymWorkoutId) REFERENCES gymWorkouts(gymWorkoutId) ON DELETE CASCADE,
    FOREIGN KEY (exerciseId) REFERENCES exercises(exerciseId)
);

-- CARDIO WORKOUTS (general cardio session data)
CREATE TABLE cardioWorkouts (
    cardioWorkoutId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    workoutName VARCHAR(120),
    workoutDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- NEW TABLE: cardioExercises (details of cardio exercises)
CREATE TABLE cardioExercises (
    cardioExerciseId INT PRIMARY KEY AUTO_INCREMENT,
    cardioWorkoutId INT,
    exerciseId INT,
    description VARCHAR(255),
    distance FLOAT,
    type VARCHAR(50),
    FOREIGN KEY (cardioWorkoutId) REFERENCES cardioWorkouts(cardioWorkoutId) ON DELETE CASCADE,
    FOREIGN KEY (exerciseId) REFERENCES exercises(exerciseId)
);

-- POINTS
CREATE TABLE points (
    pointId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    points INT DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

SELECT * FROM users;

-- Sample exercises insertion
INSERT INTO exercises (exerciseName, exercisePhoto)
VALUES 
    ('Bench Press', '/server/uploads/exercicios/supino.webp'),
    ('Lateral Raise', '/server/uploads/exercicios/elevacaoLat.jpg'),
    ('Cable Crossover', '/server/uploads/exercicios/crucifixo.webp'),
    ('Incline Bench Press', '/server/uploads/exercicios/supinoIncli.jpg'),
    ('French Press', '/server/uploads/exercicios/tricepsFrances.jpg'),
    ('Triceps Pushdown', '/server/uploads/exercicios/tricepsPolia.webp');

SELECT * FROM exercises;
SELECT * FROM gymWorkouts;
SELECT * FROM gymWorkoutExercises;
SELECT * FROM cardioWorkouts;

-- DELETE FROM * WHERE id = 1 OR userId = 1;

-- DROP DATABASE gymFlow;