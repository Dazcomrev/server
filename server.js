const express = require('express');
const cors = require('cors');
const db = require("./db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Разрешаем запросы с фронтенда (порт 3000)
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use(express.json());

// Пример API: получить список команд
app.get('/api/listTeams', async (req, res) => {
    try {
        const result = await db.getListTeams();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/teamCard/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId; // получаем переменную из URL
        const team = await db.getTeamCard(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Команда не найдена' });
        }
        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/playerCard/:playerId', async (req, res) => {
    try {
        const playerId = req.params.playerId; // получаем переменную из URL
        const player = await db.getPlayerCard(playerId);
        if (!player) {
            return res.status(404).json({ error: 'Игрок не найден' });
        }
        res.json(player);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/log', async (req, res) => {
    try {
        const { userId, actionType, actionDetails } = req.body; // получаем данные из тела запроса
        if (!userId || !actionType || !actionDetails) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.addLog(userId, actionType, actionDetails);
        //const newLog = 
        //res.status(201).json(newLog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

const uploadNone = multer();

app.get('/api/edit/team/getTeams', async (req, res) => {
    try {
        const result = await db.getTeamsForEditTeam();
        console.log(result);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/edit/team/getAllPlayers', async (req, res) => {
    try {
        const result = await db.getAllPlayers();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/team/addTeam', uploadNone.none(), async (req, res) => {
    try {
        const {NameTeam} = req.body;
        if (!NameTeam) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.addTeam(NameTeam);

        res.json({ message: 'Команда успешно создана', data: NameTeam });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});


app.post('/api/edit/team/removeTeam', uploadNone.none(), async (req, res) => {
    try {
        const { TeamId } = req.body;
        if (!TeamId) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.removeTeam(TeamId);

        res.json({ message: 'Команда успешно удалена', data: TeamId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/team/editNameTeam', uploadNone.none(), async (req, res) => {
    try {
        const { TeamId, NewTeamName } = req.body;
        if (!TeamId || !NewTeamName) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.editNameTeam(TeamId, NewTeamName);

        res.json({ message: 'Название команды успешно изменено', data: { TeamId: TeamId, NewTeamName: NewTeamName } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/team/addPlayerInTeam', uploadNone.none(), async (req, res) => {
    try {
        const { TeamId, PlayerId, DateAdd } = req.body;
        if (!TeamId || !PlayerId || !DateAdd) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.addPlayerInTeam(TeamId, PlayerId, DateAdd);

        res.json({ message: 'Игрок успешно добавлен в команду', data: { TeamId: TeamId, PlayerId: PlayerId, DateAdd: DateAdd } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/team/removePlayerFromTeam', uploadNone.none(), async (req, res) => {
    try {
        const { TeamId, PlayerId, DateLeft } = req.body;
        if (!TeamId || !PlayerId || !DateLeft) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.removePlayerFromTeam(CompositionId, DateLeft);

        res.json({ message: 'Игрок успешно удален из команды', data: { TeamId: TeamId, PlayerId: PlayerId, DateLeft: DateLeft } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

const imagesPath = path.join(__dirname, 'public/images');

app.use('/images', express.static(imagesPath));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
    
});

const upload = multer({ storage });

app.post('/api/upload-player', upload.single('Photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Имя файла, выбранное на клиенте
    //console.log('Имя файла на клиенте:', req.file.originalname);

    // Если вы передаете имя файла в теле запроса (например, req.body.filename), можно вывести и его:
    /*
    console.log('Имя игрока:', req.body.FirstName);
    console.log('Фамилия игрока:', req.body.SecondName);
    console.log('Отчество игрока:', req.body.ThirdName);
    console.log('Возраст игрока:', req.body.Age);*/

    // Отвечаем клиенту
    res.json({ message: 'Файл успешно загружен', filename: req.file.filename });
});

app.post('/api/update-player/:id', upload.single('Photo'), async (req, res) => {
    try {
        const playerId = req.params.id;
        const FirstName = req.body.FirstName;
        const SecondName = req.body.SecondName;
        const ThirdName = req.body.ThirdName;
        const Age = req.body.Age;
        const OldPhoto = req.body.OldPhoto;
        const newPhoto = req.file;

        // Получаем имя старого фото из БД
        //const oldPhotoFilename = await getOldPhotoFilenameById(playerId);

        // Если пришло новое фото и есть старое — удаляем старое с диска
        if (newPhoto && OldPhoto) {
            const OldPhotoPath = path.join(imagesPath, OldPhoto);
            console.log('OldPhotoPath:', OldPhotoPath);
            fs.unlink(OldPhotoPath, (err) => {
                if (err) console.error('Ошибка удаления старого фото:', err);
                else console.log('Старое фото удалено:', OldPhoto);
            });
        }

        // Формируем объект для обновления
        const updateData = {
            FirstName,
            SecondName,
            ThirdName,
            Age,
            photo: newPhoto ? newPhoto.filename : OldPhoto
        };

        // Обновляем данные игрока в БД
        //await updatePlayerData(playerId, updateData);

        res.json({ message: 'Данные обновлены', data: updateData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Backend сервер запущен на http://localhost:${port}`);
});