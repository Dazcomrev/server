const express = require('express');
const cors = require('cors');
const db = require("./db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

const webURL = 'https://aesthetic-creponne-ffd0c8.netlify.app';

app.use(cors({
    origin: webURL,
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', webURL);
        res.header('Access-Control-Allow-Methods', 'GET,POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());

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
        const teamId = req.params.teamId;
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
        const playerId = req.params.playerId;
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
        const { userId, actionType, actionDetails } = req.body;
        if (!userId || !actionType || !actionDetails) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.addLog(userId, actionType, actionDetails);
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
        const { TeamId, PlayerId, DateLeft, DateAdd } = req.body;
        if (!TeamId || !PlayerId || !DateLeft || !DateAdd) {
            return res.status(400).json({ error: 'Ошикбка в содержании логов' });
        }
        await db.removePlayerFromTeam(TeamId, PlayerId, DateLeft, DateAdd);

        res.json({ message: 'Игрок успешно удален из команды', data: { TeamId: TeamId, PlayerId: PlayerId, DateLeft: DateLeft, DateAdd: DateAdd } });
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

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            console.warn('Файл для удаления не найден:', filePath);
        }

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
            fs.unlink(OldPhotoPath, (err) => {
                if (err) console.error('Ошибка удаления старого фото:', err);
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend сервер запущен на port:${PORT}`);
});