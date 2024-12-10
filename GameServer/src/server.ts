import { createServer } from "http";
import { Server, Socket } from "socket.io";
import connectDB from "./database";
import {decodeToken} from "./api/middlewares/user.middlewares";
import PlayModel from "./database/schemas/userPlay";
import {UserModel} from "./database/schemas/user";

// Создание HTTP-сервера и инициализация Socket.io сервера
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5174", // Разрешенный источник для CORS
        methods: ["GET", "POST"],
    },
});

// Типы данных для игроков и комнат
interface Player {
    socket: Socket;
    userId?:string;
    online: boolean;
    playing?: boolean;
    playerName?: string;
    playerId?: string;
    letter: 0 | 1;
}

function generateCode(): string {
    const code = Math.floor(10000 + Math.random() * 90000); // Генерируем число от 10000 до 99999
    return code.toString(); // Возвращаем его как строку
}

interface Room {
    player1: Player;
    player2?: Player;
    roomId: string;
    board: number[]; // Состояние доски, где -1 - пустое поле, 0 - крестик, 1 - нолик
    turn:number
}

// Словарь всех игроков и список всех комнат
const allUsers: Record<string, Player> = {};
const allRooms: Room[] = [];

function checkGameStatus(board: number[]): number {
    const grid: number[][] = [];
    for (let i = 0; i < 3; i++) {
        grid.push(board.slice(i * 3, i * 3 + 3));
    }

    // Проверка на победу по строкам, столбцам и диагоналям
    const checkLine = (a: number, b: number, c: number): boolean => a === b && b === c && a !== -1;

    // Проверяем строки
    for (let i = 0; i < 3; i++) {
        if (checkLine(grid[i][0], grid[i][1], grid[i][2])) {
            return grid[i][0]; // Возвращаем победителя: 0 или 1
        }
    }

    // Проверяем столбцы
    for (let i = 0; i < 3; i++) {
        if (checkLine(grid[0][i], grid[1][i], grid[2][i])) {
            return grid[0][i]; // Возвращаем победителя: 0 или 1
        }
    }

    // Проверка диагоналей
    if (checkLine(grid[0][0], grid[1][1], grid[2][2])) {
        return grid[0][0]; // Победитель на главной диагонали
    }
    if (checkLine(grid[0][2], grid[1][1], grid[2][0])) {
        return grid[0][2]; // Победитель на побочной диагонали
    }

    // Если нет победителя и все клетки заняты, ничья
    return -1;
}
function endGame(room: Room) {
    // Закрываем игру
    const player1 = room.player1;
    const player2 = room.player2;

    player1.socket.removeAllListeners("playerMoveFromClient");
    if(!player2) return
    player2.socket.removeAllListeners("playerMoveFromClient");

    // Удаляем комнату
    const roomIndex = allRooms.indexOf(room);
    if (roomIndex !== -1) {
        allRooms.splice(roomIndex, 1);
    }
}
function getRandomZeroOrOne(): number {
    return Math.random() < 0.5 ? 0 : 1;
}

io.on("connection", (socket: Socket) => {
    console.log("user connected ", socket.id)
    // Когда игрок подключается
    allUsers[socket.id] = {
        socket,
        online: true,
        letter:0
    };

    socket.on("request_to_play", async(data: { token: string }) => {
        console.log("user ", socket.id, "send request to play")
        const getData = decodeToken(data.token)

        const currentUser = allUsers[socket.id];
        if(getData.passed){
            allUsers[socket.id].online = true
            currentUser.playerName = getData.name;
            currentUser.userId = getData._id
        }else{
            allUsers[socket.id].online = false
        }


        let opponentPlayer: Player | undefined;

        const roomI = allRooms.findIndex(
            (room) =>
                room.player1.socket.id === currentUser.socket.id ||
                (room.player2 && room.player2.socket.id === currentUser.socket.id)
        );

        if(roomI > -1){
            if(allRooms[roomI].player1.socket.id === currentUser.socket.id && allRooms[roomI].player2){
                io.to(allRooms[roomI].player2.socket.id).emit("gameWon",{winner:allRooms[roomI].player2.letter})

                const player1Exist = await UserModel.findById(allRooms[roomI].player1.userId)
                if(!player1Exist) return
                const player2Exist = await UserModel.findById(allRooms[roomI].player2.userId)
                if(!player2Exist) return

                player2Exist.rating = player2Exist.rating + 10
                await player2Exist.save()

                player1Exist.rating = player1Exist.rating - 10
                await player1Exist.save()
                 PlayModel.create(
                    {
                        player1:player1Exist._id,
                        winnerId:player2Exist._id,
                        player2:player2Exist._id,
                        type:"win"
                    }
                )


            }
            if( allRooms[roomI].player2 && allRooms[roomI].player2.socket.id === currentUser.socket.id){
                io.to(allRooms[roomI].player1.socket.id).emit("gameWon",{winner:allRooms[roomI].player1.letter})
                const player1Exist = await UserModel.findById(allRooms[roomI].player1.userId)
                if(!player1Exist) return
                const player2Exist = await UserModel.findById(allRooms[roomI].player2.userId)
                if(!player2Exist) return

                player1Exist.rating = player1Exist.rating + 10
                await player1Exist.save()

                player2Exist.rating = player2Exist.rating - 10
                await player2Exist.save()

                PlayModel.create(
                    {
                        player1:player1Exist._id,
                        winnerId:player1Exist._id,
                        player2:player2Exist._id,
                        type:"win"
                    }
                )
            }
            allRooms.splice(roomI, 1);
        }


        for (const key in allUsers) {
            const user = allUsers[key];
            if (user.online && !user.playing && socket.id !== key && io.sockets.sockets.has(key || "")) {
                opponentPlayer = user;
                break;
            }
        }

        // Если соперник найден
        if (opponentPlayer) {
            // Создание комнаты с двумя игроками
            const roomId = generateCode();
            const turnPlayer = getRandomZeroOrOne();
            allRooms.push({
                player1: opponentPlayer,
                player2: currentUser,
                roomId,
                board: new Array(9).fill(-1), // Заполняем доску пустыми значениями
                turn:turnPlayer
            });

            // Уведомление обоих игроков о начале игры
            currentUser.socket.emit("OpponentFound", {
                opponentName: opponentPlayer.playerName,
                playingAs: 0, // Текущий игрок играет за "круг",
                turn:turnPlayer
            });

            opponentPlayer.socket.emit("OpponentFound", {
                opponentName: currentUser.playerName,
                playingAs: 1, // Соперник играет за "крест"
                turn:turnPlayer
            });

            currentUser.letter = 0;
            opponentPlayer.letter = 1;

            // Обработчик хода от игрока
            // Обработчик хода от игрока
            currentUser.socket.on("playerMoveFromClient", async(data: { index: number }) => {
                const index = data.index;
                if (index < 0 || index > 8) return;

                // Находим комнату, в которой играет игрок
                const roomIndex = allRooms.findIndex(
                    (room) =>
                        room.player1.socket.id === currentUser.socket.id ||
                        (room.player2 && room.player2.socket.id === currentUser.socket.id)
                );



                const room = allRooms[roomIndex];

                if (!room || room.board[index] !== -1 || room.turn !== currentUser.letter) return; // Игрок не должен ходить, если не его ход

                // Обновляем доску
                room.board[index] = currentUser.letter as number; // Явное приведение типа

                room.turn = opponentPlayer.letter; // Меняем ход

                opponentPlayer.socket.emit("playerMoveFromServer", {index:index, turn:opponentPlayer?.letter});

                // Проверяем статус игры
                const result = checkGameStatus(room.board);
                console.log("result", result)
                console.log("current PlayerName", currentUser.playerName )
                console.log("opponent PlayerName", opponentPlayer.playerName )
                if (result === currentUser.letter) {
                    // Игрок победил
                    currentUser.socket.emit("gameWon", { winner: result?"X":"O" });
                    opponentPlayer.socket.emit("gameWon", { winner: result?"X":"O" });
                    endGame(room);
                    allUsers[opponentPlayer?.socket.id].online = false

                    allUsers[currentUser.socket.id].online = false

                    const player1Exist = await UserModel.findById(currentUser.userId)
                    if(!player1Exist) return
                    const player2Exist = await UserModel.findById(opponentPlayer.userId)
                    if(!player2Exist) return

                    player1Exist.rating = player1Exist.rating + 10
                    await player1Exist.save()

                    player2Exist.rating = player2Exist.rating - 10
                    await player2Exist.save()
                    PlayModel.create(
                        {
                            player1:player1Exist._id,
                            winnerId:player1Exist._id,
                            player2:player2Exist._id,
                            type:"win"
                        }
                    )
                } else if (result === -1 && room.board.every(cell => cell !== -1)) {
                    // Ничья, если все клетки заняты
                    currentUser.socket.emit("gameTied");
                    opponentPlayer.socket.emit("gameTied");
                    endGame(room);
                    allUsers[opponentPlayer?.socket.id].online = false
                    allUsers[currentUser.socket.id].online = false

                    const player1Exist = await UserModel.findById(currentUser.userId)
                    if(!player1Exist) return
                    const player2Exist = await UserModel.findById(opponentPlayer.userId)
                    if(!player2Exist) return

                    PlayModel.create(
                        {
                            player1:player1Exist._id,
                            player2:player2Exist._id,
                            type:"tied"
                        }
                    )
                }
            });

            opponentPlayer.socket.on("playerMoveFromClient", async (data: { index: number }) => {
                const index = data.index;
                if (index < 0 || index > 8) return;

                // Находим комнату, в которой играет игрок
                const roomIndex = allRooms.findIndex(
                    (room) =>
                        room.player1.socket.id === opponentPlayer.socket.id ||
                        (room.player2 && room.player2.socket.id === opponentPlayer.socket.id)
                );

                const room = allRooms[roomIndex];
                if (!room || room.board[index] !== -1 || room.turn !== opponentPlayer.letter) return; // Игрок не должен ходить, если не его ход

                // Обновляем доску
                room.board[index] = opponentPlayer.letter as number; // Явное приведение типа
                room.turn = currentUser.letter; // Меняем ход

                currentUser.socket.emit("playerMoveFromServer", {index:index, turn:currentUser.letter});

                // Проверяем статус игры
                const result = checkGameStatus(room.board);


                if (result === opponentPlayer.letter) {
                    opponentPlayer.socket.emit("gameWon", { winner:result?"X":"O" });
                    currentUser.socket.emit("gameWon", { winner: result?"X":"O"});
                    endGame(room);
                    allUsers[opponentPlayer?.socket.id].online = false
                    allUsers[currentUser.socket.id].online = false

                    const player1Exist = await UserModel.findById(currentUser.userId)
                    if(!player1Exist) return
                    const player2Exist = await UserModel.findById(opponentPlayer.userId)
                    if(!player2Exist) return

                    player1Exist.rating = player1Exist.rating - 10
                    await player1Exist.save()

                    player2Exist.rating = player2Exist.rating + 10
                    await player2Exist.save()

                    PlayModel.create(
                        {
                            player1:player1Exist._id,
                            player2:player2Exist._id,
                            winnerId:player2Exist._id,
                            type:"win"
                        }
                    )

                } else if (result === -1 && room.board.every(cell => cell !== -1)) {
                    // Ничья, если все клетки заняты
                    opponentPlayer.socket.emit("gameTied");
                    currentUser.socket.emit("gameTied");
                    endGame(room);

                    allUsers[opponentPlayer?.socket.id].online = false
                    allUsers[currentUser.socket.id].online = false

                    const player1Exist = await UserModel.findById(currentUser.userId)
                    if(!player1Exist) return
                    const player2Exist = await UserModel.findById(opponentPlayer.userId)
                    if(!player2Exist) return

                    PlayModel.create(
                        {
                            player1:player1Exist._id,
                            player2:player2Exist._id,
                            type:"tied"
                        }
                    )
                }
            });

        } else {
            // Если соперник не найден
            currentUser.socket.emit("OpponentNotFound");
        }
    });

    // Обработчик отключения пользователя
    socket.on("disconnect", async() => {
        const currentUser = allUsers[socket.id];
        currentUser.online = false;
        currentUser.playing = false;

        // Проверяем, был ли игрок в комнате
        for (let index = 0; index < allRooms.length; index++) {
            const { player1, player2 } = allRooms[index];


            if (player1.socket.id === socket.id) {
                player2?.socket.emit("gameWon",{winner:player2?.letter})
                if(player2) allUsers[player2?.socket.id].online = false
                allRooms.splice(index, 1);

                const player1Exist = await UserModel.findById(player1.userId)
                if(!player1Exist || !player2) return
                const player2Exist = await UserModel.findById(player2.userId)
                if(!player2Exist) return

                player1Exist.rating = player1Exist.rating - 10
                await player1Exist.save()

                player2Exist.rating = player2Exist.rating + 10
                await player2Exist.save()
                PlayModel.create(
                    {
                        player1:player1Exist._id,
                        player2:player2Exist._id,
                        winnerId:player2Exist._id,
                        type:"win"
                    }
                )
                break;
            }

            if (player2?.socket.id === socket.id) {
                player1.socket.emit("gameWon",{winner:player1.letter})
                allUsers[player1.socket.id].online = false
                allRooms.splice(index, 1);

                const player1Exist = await UserModel.findById(player1.userId)
                if(!player1Exist || !player2) return
                const player2Exist = await UserModel.findById(player2.userId)
                if(!player2Exist) return

                player1Exist.rating = player1Exist.rating + 10
                await player1Exist.save()

                player2Exist.rating = player2Exist.rating - 10
                await player2Exist.save()

                PlayModel.create(
                    {
                        player1:player1Exist._id,
                        player2:player2Exist._id,
                        winnerId:player1Exist._id,
                        type:"win"
                    }
                )
                break;
            }
        }

        // Убираем игрока из списка всех пользователей
        delete allUsers[socket.id];
    });
});

// Запуск HTTP сервера
httpServer.listen(4000, () => {
    console.log("Server is running on port 4000");
    connectDB()
});
