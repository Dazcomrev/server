const express = require('express');
const cors = require('cors');
const db = require("./db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Разрешаем запросы с фронтенда (порт 3000)
app.use(cors({
    origin: 'https://aesthetic-creponne-ffd0c8.netlify.app',
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
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/getAllPlayers', async (req, res) => {
    try {
        const result = await db.getAllPlayers();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/getCompetitionsForEditCompetition', async (req, res) => {
    try {
        const result = await db.getCompetitionsForEditCompetition();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/getCompetitionsForEditMatch', async (req, res) => {
    try {
        const result = await db.getCompetitionsForEditMatch();
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

app.post('/api/edit/player/addPlayer', upload.single('Photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }
        const Photo = req.file.filename;
        const { FirstName, SecondName, ThirdName, Age } = req.body;
        if (!FirstName || !SecondName ||  !Age || !Photo) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        if (!ThirdName) {
            if (ThirdName != '') {
                return res.status(400).json({ error: 'Ошикбка в содержании логов' });
            }
        }
        await db.addPlayer(FirstName, SecondName, ThirdName, Age, Photo);
        res.json({
            messageFile: 'Файл успешно загружен', filename: req.file.filename,
            messageDB: 'Новый игрок успешно добавлен', data: {
                FirstName: FirstName,
                SecondName: SecondName,
                ThirdName: ThirdName,
                Age: Age,
                Photo: Photo
            }
        });

        // Имя файла, выбранное на клиенте
        //console.log('Имя файла на клиенте:', req.file.originalname);

        // Если вы передаете имя файла в теле запроса (например, req.body.filename), можно вывести и его:
        /*
        console.log('Имя игрока:', req.body.FirstName);
        console.log('Фамилия игрока:', req.body.SecondName);
        console.log('Отчество игрока:', req.body.ThirdName);
        console.log('Возраст игрока:', req.body.Age);*/

        // Отвечаем клиенту

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/player/removePlayer', uploadNone.none(), async (req, res) => {
    try {
        const { OldPhoto, PlayerId } = req.body;
        if (!OldPhoto || !PlayerId) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        const filePath = path.join(imagesPath, OldPhoto);
        // Проверяем, существует ли файл
        if (fs.existsSync(filePath)) {
            // Удаляем файл
            fs.unlinkSync(filePath);
        } else {
            // Можно игнорировать, если файла нет, или вернуть ошибку
            console.warn('Файл для удаления не найден:', filePath);
        }
        // Удаляем игрока из базы данных (пример для MongoDB)
        await db.removePlayer(PlayerId);

        res.json({ message: 'Данные удалены', data: { PlayerId: PlayerId, OldPhoto: OldPhoto } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/player/editDataPlayer', upload.single('Photo'), async (req, res) => {
    try {
        const NewPhoto = req.file;
        const { PlayerId, FirstName, SecondName, ThirdName, Age, OldPhoto } = req.body;

        // Если пришло новое фото и есть старое — удаляем старое с диска
        if (!PlayerId || !FirstName || !SecondName || !Age || !OldPhoto) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        if (!ThirdName) {
            if (ThirdName != '') {
                return res.status(400).json({ error: 'Ошикбка в содержании логов' });
            }
        }
        if (NewPhoto && OldPhoto) {
            const OldPhotoPath = path.join(imagesPath, OldPhoto);
            //console.log('OldPhotoPath:', OldPhotoPath);
            fs.unlink(OldPhotoPath, (err) => {
                if (err) console.error('Ошибка удаления старого фото:', err);
                //else console.log('Старое фото удалено:', OldPhoto);
            });
        }
        const Photo = NewPhoto ? NewPhoto.filename : OldPhoto;
        await db.editDataPlayer(PlayerId, FirstName, SecondName, ThirdName, Age, Photo);

        res.json({
            message: 'Данные игрока успешно изменены', data: {
                PlayerId: PlayerId,
                FirstName: FirstName,
                SecondName: SecondName,
                ThirdName: ThirdName,
                Age: Age,
                Photo: Photo
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/competition/addCompetition', uploadNone.none(), async (req, res) => {
    try {
        const { CompetitionName, DateStart } = req.body;
        if (!CompetitionName || !DateStart) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.addCompetition(CompetitionName, DateStart);

        res.json({ message: 'Соревнование успешно создано', data: { CompetitionName, DateStart } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/competition/removeCompetition', uploadNone.none(), async (req, res) => {
    try {
        const { CompetitionId } = req.body;
        if (!CompetitionId) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.removeCompetition(CompetitionId);

        res.json({ message: 'Соревнование успешно удалено', data: CompetitionId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/competition/editDataCompetition', uploadNone.none(), async (req, res) => {
    try {
        const { CompetitionId, CompetitionName, DateStart } = req.body;
        if (!CompetitionId || !CompetitionName || !DateStart) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.editDataCompetition(CompetitionId, CompetitionName, DateStart);

        res.json({ message: 'Данные соревнования успешно изменены', data: { CompetitionId, CompetitionName, DateStart } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/competition/addTeamInCompetition', async (req, res) => {
    try {
        const { entries, CompetitionId } = req.body;
        if (!CompetitionId || !entries) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }

        if (!Array.isArray(entries)) {
            return res.status(400).json({ error: 'entries должен быть массивом' });
        }

        await db.addTeamInCompetition(entries, CompetitionId);

        res.json({ message: 'Команда успешно добавлена в соревнование', data: { entries, CompetitionId } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/competition/removeTeamFromCompetition', async (req, res) => {
    try {
        const { CompetitionId, entries } = req.body;
        if (!CompetitionId || !entries) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }

        if (!Array.isArray(entries)) {
            return res.status(400).json({ error: 'entries должен быть массивом' });
        }

        await db.removeTeamFromCompetition(CompetitionId, entries);

        res.json({ message: 'Команда успешно удалена из соревнования', data: { CompetitionId, entries } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/competition/editTeamPlaces', async (req, res) => {
    try {
        const { CompetitionId, entries } = req.body;
        if (!CompetitionId || !entries) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }

        if (!Array.isArray(entries)) {
            return res.status(400).json({ error: 'entries должен быть массивом' });
        }

        await db.editTeamPlaces(CompetitionId, entries);

        res.json({ message: 'Место команды в соревновании успешно изменено', data: { CompetitionId, entries } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/match/addMatch', uploadNone.none(), async (req, res) => {
    try {
        const { CompetitionId, TeamId1, TeamId2, WinnerId, DateMatch, Score1, Score2 } = req.body;
        if (!CompetitionId || !TeamId1 || !TeamId2 || !WinnerId || !DateMatch || !Score1 || !Score2) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }

        await db.addMatch(CompetitionId, TeamId1, TeamId2, WinnerId, DateMatch, Score1, Score2);

        res.json({ message: 'Матч успешно создан', data: { CompetitionId, TeamId1, TeamId2, WinnerId, DateMatch, Score1, Score2 } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/match/removeMatch', uploadNone.none(), async (req, res) => {
    try {
        const { MatchId } = req.body;
        if (!MatchId) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.removeMatch(MatchId);

        res.json({ message: 'Матч успешно удален', data: MatchId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/edit/match/editDataMatch', uploadNone.none(), async (req, res) => {
    try {
        const { MatchId, TeamId1, TeamId2, WinnerId, DateMatch, Score1, Score2, } = req.body;
        if (!MatchId || !TeamId1 || !TeamId2 || !WinnerId || !DateMatch || !Score1 || !Score2) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }

        await db.editDataMatch(MatchId, WinnerId, DateMatch, TeamId1, TeamId2, Score1, Score2);

        res.json({ message: 'Данные матча успешно изменены', data: { MatchId, TeamId1, TeamId2, WinnerId, DateMatch, Score1, Score2 } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend сервер запущен на http://localhost:${PORT}`);
});