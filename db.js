const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'EsportInCompetition',
    password: '123456',
    port: 5432,
});

// Для адекватного отображения даты
//.toISOString().split('T')[0]


// Список команд
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Убрать сортировку по TeanId, возможно стоит сортировать по названию
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
async function getListTeams() {
    try {
        const res = await pool.query('SELECT "TeamId", "TeamName", "NumberWins", "NumberDefeats", "FrequencyWins"\
            FROM "Team" ORDER BY "TeamId" ASC');
        return res.rows;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

// Карточка команды
async function getTeamCard(TeamId) {
    try {
        const name = await getTeamName(TeamId);
        const players = await getPlayersTeam(TeamId);
        const history = await getHistoryTeam(TeamId);
        const frequency = await getFrequencyWinsTeam(TeamId);
        const res = { 'name': name, 'players': players, 'history': history, 'frequency': frequency };
        return res;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getTeamName(TeamId) {
    try {
        const res = await pool.query('SELECT "TeamName"\
            FROM "Team"\
            WHERE "TeamId" = $1', [TeamId]);
        return res.rows[0]['TeamName'];
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getPlayersTeam(TeamId) {
    try {
        const res = await pool.query('SELECT p."PlayerId", "FirstName", "SecondName", "ThirdName", "Photo"\
            FROM "Composition" c JOIN "Player" p ON p."PlayerId" = c."PlayerId"\
            WHERE "TeamId" = $1 AND "DateLeft" IS NULL;', [TeamId]);
        const dicts = res.rows;
        let players = [];
        for (let i = 0; i < dicts.length; i = i + 1) {
            const fio = `${dicts[i]["SecondName"]} ${dicts[i]["FirstName"]} ${dicts[i]["ThirdName"]}`;
            players.push({ 'PlayerId': dicts[i]['PlayerId'], 'FIO': fio, 'Photo': dicts[i]['Photo'] });
        }
        return players;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getHistoryTeam(TeamId) {
    try {
        const res = await pool.query(`SELECT "CompetitionName", TO_CHAR("DateStart", 'DD.MM.YYYY') AS "DateStart", "Place"
            FROM "Team" t JOIN "TeamInCompetition" tic ON tic."TeamId" = t."TeamId"
            JOIN "Competition" c ON tic."CompetitionId" = c."CompetitionId"
            WHERE t."TeamId" = $1;`, [TeamId]);
        return res.rows;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getFrequencyWinsTeam(TeamId) {
    try {
        const res = await pool.query('SELECT "FrequencyWins"\
            FROM "Team"\
            WHERE "TeamId" = $1;', [TeamId]);
        return res.rows[0]['FrequencyWins'];
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

// Карточка игрока
async function getPlayerCard(PlayerId) {
    try {
        const fio = await getPlayerFIO(PlayerId);
        const age = await getPlayerAge(PlayerId);
        const pathPhoto = await getPathToPlayerPhoto(PlayerId);
        const history = await getPlayerHistoryInTeams(PlayerId);
        const res = { 'FIO': fio, 'Age': age, 'pathPhoto': pathPhoto, 'history': history, };
        return res;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getPlayerFIO(PlayerId) {
    try {
        const res = await pool.query('SELECT "FirstName", "SecondName", "ThirdName"\
            FROM "Player"\
            WHERE "PlayerId" = $1;', [PlayerId]);
        return `${res.rows[0]["SecondName"]} ${res.rows[0]["FirstName"]} ${res.rows[0]["ThirdName"]}`;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getPlayerAge(PlayerId) {
    try {
        const res = await pool.query('SELECT "Age"\
            FROM "Player"\
            WHERE "PlayerId" = $1;', [PlayerId]);
        return res.rows[0]["Age"];
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getPathToPlayerPhoto(PlayerId) {
    try {
        const res = await pool.query('SELECT "Photo"\
            FROM "Player"\
            WHERE "PlayerId" = $1;', [PlayerId]);
        return res.rows[0]["Photo"];
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getPlayerHistoryInTeams(PlayerId) {
    try {
        const res = await pool.query(`SELECT "TeamName", TO_CHAR("DateAdd", 'DD.MM.YYYY') AS "DateAdd", TO_CHAR("DateLeft", 'DD.MM.YYYY') AS "DateLeft"
            FROM "Composition" c JOIN "Team" t ON t."TeamId" = c."TeamId"
            WHERE "PlayerId" = $1
            ORDER BY "DateAdd" ASC;`, [PlayerId]);
        return res.rows;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}
/*
!!!!!!!!!!!!!!!!!!!
Функция логирования
!!!!!!!!!!!!!!!!!!!
*/
async function addLog(userId, actionType, actionDetails) {
    try {
        await pool.query(`INSERT INTO "Log" ("userId", "timestamp", "actionType", "actionDetails")\
            VALUES ($1, NOW(), $2, $3);`, [userId, actionType, actionDetails]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}
/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Функции для редактирования данных
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
//Получение списка словарей (нужны в разных разделах редактирования)
async function getTeamsForEditTeam() {
    try {
        const res = await pool.query('SELECT "TeamId", "TeamName"\
            FROM "Team" ORDER BY "TeamId" ASC');
        const teams = res.rows;
        let teamsWithPlayers = [];
        for (let i = 0; i < teams.length; i = i + 1) {
            const res0 = await getPlayersTeam(teams[i].TeamId);
            teams[i]['players'] = res0;
        }
        return teams;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getAllPlayers() {
    try {
        const res = await pool.query('SELECT "PlayerId", "FirstName", "SecondName", "ThirdName", "Photo", "Age"\
            FROM "Player"', []);
        const dicts = res.rows;
        let players = [];
        for (let i = 0; i < dicts.length; i = i + 1) {
            const fio = `${dicts[i]["SecondName"]} ${dicts[i]["FirstName"]} ${dicts[i]["ThirdName"]}`;
            players.push({ 'PlayerId': dicts[i]['PlayerId'], 'FIO': fio, 'Photo': dicts[i]['Photo'], 'Age': dicts[i]['Age'] });
        }
        return players;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getCompetitionsForEditCompetition() {
    try {
        const res = await pool.query(`SELECT "CompetitionId", "CompetitionName", TO_CHAR("DateStart", 'DD.MM.YYYY') AS "DateStart"
            FROM "Competition"`, []);
        const dicts = res.rows;

        for (let i = 0; i < dicts.length; i = i + 1) {
            const res0 = await pool.query(`SELECT t."TeamId", "TeamName", "Place"
            FROM "Competition" c JOIN "TeamInCompetition" tic ON c."CompetitionId" = tic."CompetitionId"
            JOIN "Team" t ON t."TeamId" = tic."TeamId"
            WHERE c."CompetitionId" = $1`, [dicts[i]['CompetitionId']]);
            dicts[i]['teams'] = res0.rows;
        }
        return dicts;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function getCompetitionsForEditMatch() {
    try {
        const competitions = await getCompetitionsForEditCompetition();

        for (let i = 0; i < competitions.length; i = i + 1) {
            const res = await pool.query(`SELECT "MatchId", "WinnerId", TO_CHAR("DateMatch", 'DD.MM.YYYY') AS "DateMatch"
            FROM "Competition" c JOIN "Match" m ON c."CompetitionId" = m."CompetitionId"
            WHERE c."CompetitionId" = $1`, [competitions[i]['CompetitionId']]);
            const dicts = res.rows;
            let matchs = [];
            for (let j = 0; j < dicts.length; j = j + 1) {
                const res0 = await pool.query(`SELECT "TeamId", "Score"
                FROM "TeamInMatch" tim
                WHERE tim."MatchId" = $1`, [dicts[j]['MatchId']]);
                const TS = res0.rows;
                dicts[j]['Team1'] = TS[0].TeamId;
                dicts[j]['Score1'] = TS[0].Score;
                dicts[j]['Team2'] = TS[1].TeamId;
                dicts[j]['Score2'] = TS[1].Score;
            }
            competitions[i]['matchs'] = dicts;
        }
        return competitions;
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}
//EditTeam
async function addTeam(TeamName) {
    try {
        await pool.query(`INSERT INTO "Team" ("TeamName", "NumberWins", "NumberDefeats", "FrequencyWins")
            VALUES ($1, 0, 0, 0.00);`, [TeamName]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function removeTeam(TeamId) {
    try {
        await pool.query(`DELETE FROM "Team"
            WHERE "TeamId" = $1`, [TeamId]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function editNameTeam(TeamId, NewTeamName) {
    try {
        await pool.query(`UPDATE "Team"
            SET "TeamName" = $2
            WHERE "TeamId" = $1;`, [TeamId, NewTeamName]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

НЕОБХОДИМО СДЕЛАТЬ ПРОВЕРКУ НА ДОБАВЛЕНИЕ УЖЕ СУЩЕСТВУЮЩИХ ЗАПИСЕЙ
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
async function addPlayerInTeam(TeamId, PlayerId, DateAdd=null) {
    try {
        if (!DateAdd) {
            await pool.query(`INSERT INTO "Composition" ("TeamId", "PlayerId", "DateAdd", "DateLeft")
            VALUES ($1, $2, NOW(), NULL);`, [TeamId, PlayerId]);
        } else {
            await pool.query(`INSERT INTO "Composition" ("TeamId", "PlayerId", "DateAdd", "DateLeft")
            VALUES ($1, $2, $3::date, NULL);`, [TeamId, PlayerId, DateAdd]);
        }
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function removePlayerFromTeam(TeamId, PlayerId, DateLeft) {
    try {
        await pool.query(`UPDATE "Composition"
            SET "DateLeft" = $3::date
            WHERE "TeamId" = $1 AND "PlayerId" = $1;`, [TeamId, PlayerId, DateLeft]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

//EditPlayer
async function addPlayer(FirstName, SecondName, ThirdName, Age, Photo) {
    try {
        await pool.query(`INSERT INTO "Player" ("FirstName", "SecondName", "ThirdName", "Age", "Photo")
            VALUES ($1, $2, $3, $4, $5);`, [FirstName, SecondName, ThirdName, Age, Photo]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function removePlayer(PlayerId) {
    try {
        await pool.query(`DELETE FROM "Player"
            WHERE "PlayerId" = $1`, [PlayerId]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function editDataPlayer(PlayerId, FirstName, SecondName, ThirdName, Age, Photo) {
    try {
        await pool.query(`UPDATE "Player"
            SET "FirstName" = $2,
                "SecondName" = $3,
                "ThirdName" = $4,
                "Age" = $5,
                "Photo" = $6
            WHERE "PlayerId" = $1;`, [PlayerId, FirstName, SecondName, ThirdName, Age, Photo]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}
//EditCompetition
async function addCompetition(CompetitionName, DateStart) {
    try {
        await pool.query(`INSERT INTO "Competition" ("CompetitionName", "DateStart")
            VALUES ($1, $2::date);`, [CompetitionName, DateStart]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function removeCompetition(CompetitionId) {
    try {
        await pool.query(`DELETE FROM "Competition"
            WHERE "CompetitionId" = $1`, [CompetitionId]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function editDataCompetition(CompetitionId, CompetitionName, DateStart) {
    try {
        await pool.query(`UPDATE "Competition"
            SET "CompetitionName" = $2,
                "DateStart" = $3::date
            WHERE "CompetitionId" = $1;`, [CompetitionId, CompetitionName, DateStart]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function addTeamInCompetition(entries, CompetitionId) {
    try {
        if (!Array.isArray(entries)) {
            throw new TypeError('Параметр entries должен быть массивом');
        }
        if (entries.length === 0) {
            throw new Error('Данных для добавления нет');
        }

        // Формируем плейсхолдеры и массив значений
        const values = [];
        const placeholders = entries.map((entry, i) => {
            const idx = i * 3;
            values.push(entry.TeamId, CompetitionId, entry.Place);
            return `($${idx + 1}, $${idx + 2}, $${idx + 3})`;
        }).join(', ');
        await pool.query(`INSERT INTO "TeamInCompetition" ("TeamId", "CompetitionId", "Place")
        VALUES ${placeholders};`, values);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function removeTeamFromCompetition(TeamId, CompetitionId) {
    try {
        await pool.query(`DELETE FROM "TeamInCompetition"
            WHERE "TeamId" = $1 AND "CompetitionId" = $2;`, [TeamId, CompetitionId]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function editTeamPlaces(TeamId, CompetitionId, Place) {
    try {
        await pool.query(`UPDATE "TeamInCompetition"
            SET "Place" = $3
            WHERE "TeamId" = $1 AND "CompetitionId" = $2;`, [TeamId, CompetitionId, Place]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

//EditMatch
async function insertTeamInMatch(TeamId, MatchId, Score) {
    try {
        await pool.query(`INSERT INTO "TeamInMatch" ("TeamId", "MatchId", "Score")
            VALUES ($1, $2, $3);`, [TeamId, MatchId, Score]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function addMatch(CompetitionId, TeamId1, TeamId2, WinnerId = null, DateMatch, Score1, Score2) {
    try {
        let res = null;
        if (!WinnerId) {
            res = await pool.query(`INSERT INTO "Match" ("CompetitionId", "DateMatch")
            VALUES ($1, $2::date)
            RETURNING "MatchId";`, [CompetitionId, DateMatch]);
        } else {
            res = await pool.query(`INSERT INTO "Match" ("CompetitionId", "WinnerId", "DateMatch")
            VALUES ($1, $2, $3::date)
            RETURNING "MatchId";`, [CompetitionId, WinnerId, DateMatch]);
        }
        const MatchId = res.rows[0].MatchId;
        console.log(MatchId);
        await insertTeamInMatch(TeamId1, MatchId, Score1);
        await insertTeamInMatch(TeamId2, MatchId, Score2);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function removeMatch(MatchId) {
    try {
        await pool.query(`DELETE FROM "Match"
            WHERE "MatchId" = $1`, [MatchId]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function updateTeamInMatch(TeamId, MatchId, Score) {
    try {
        await pool.query(`UPDATE "TeamInMatch"
            SET "Score" = 
            WHERE "TeamId" = $1 AND "MatchId" = $2;`, [TeamId, MatchId, Score]);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

async function editDataMatch(MatchId, WinnerId, DateMatch, TeamId1, TeamId2, Score1, Score2) {
    try {
        await pool.query(`UPDATE "Match"
            SET "WinnerId" = $2,
                "DateMatch" = $3::date
            WHERE "MatchId" = $1;`, [MatchId, WinnerId, DateMatch]);
        await updateTeamInMatch(TeamId1, MatchId, Score1);
        await updateTeamInMatch(TeamId2, MatchId, Score2);
    } catch (err) {
        console.error('Ошибка при запросе к БД:', err);
        throw err;
    }
}

/*(async () => {
    const data = await getCompetitionsForEditMatch();
    console.log(data);
    //const rows = await getListTeams();
    //console.log(rows);
})();*/

/*(async () => {
    await removeCompetition(3);
    console.log("Da");
    //const rows = await getListTeams();
    //console.log(rows);
})();*/

module.exports = {
    getTeamCard,
    getListTeams,
    getPlayerCard,
    addLog,
    getTeamsForEditTeam,
    getAllPlayers,
    addTeam,
    removeTeam,
    editNameTeam,
    addPlayerInTeam,
    removePlayerFromTeam,
    addPlayer,
    removePlayer,
    editDataPlayer,
    getCompetitionsForEditCompetition,
    addCompetition,
    removeCompetition,
    editDataCompetition,
    addTeamInCompetition,
    removeTeamFromCompetition,
    editTeamPlaces,
    getCompetitionsForEditMatch,
    addMatch,
    removeMatch,
    editDataMatch
};