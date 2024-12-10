import SwiftUI
import SocketIO

// Ссылка на ваш сервер
struct AppUrls {
    static let socketURL = "http://localhost:4000" // Укажите URL вашего сервера
}

enum Player: String {
    case x = "X"
    case o = "O"
}

class SocketManagerWrapper: ObservableObject {
    private var manager: SocketManager!
    private var socket: SocketIOClient!
    
    // Состояния для обновления интерфейса
    @Published var isConnected = false
    @Published var isPlaying = false
    @Published var receivedMessage: String = ""
    @Published var isSearching: Bool = true
    @Published var gameState: [String] = Array(repeating: "", count: 9)  // Игровое поле
    @Published var gameOver = false
    @Published var winner: String? = nil
    @Published var opponentName: String? = nil
    @Published var playingAs: Player? = nil
    @Published var turn: Player? = nil
    
    var token: String = "" // Добавим переменную token
    
    init() {
        let url = URL(string: AppUrls.socketURL)!
        self.manager = SocketManager(socketURL: url, config: [.log(true), .compress])
        self.socket = manager.defaultSocket
        
        // Обработчики событий сокета
        setupSocketHandlers()
    }
    
    func reset() {
        gameState = Array(repeating: "", count: 9)
        isPlaying = false
        receivedMessage = ""
        isSearching = false
        gameOver = false
        winner = nil
        opponentName = nil
        playingAs = nil
        turn = nil
    }
    
    func connect() {
        print("Attempting to connect...")
        socket.connect()
        requestToPlay(token: token)  // Передаем token при подключении
    }
    
    func disconnect() {
        print("Disconnecting...")
        socket.disconnect()
    }
    
    // Обработчики событий сокета
    private func setupSocketHandlers() {
        socket.on(clientEvent: .connect) { data, ack in
            DispatchQueue.main.async {
                self.isConnected = true
                self.requestToPlay(token: self.token)
            }
            print("Connected to server")
        }
        
        socket.on("OpponentFound") { data, ack in
            if let opponent = data[0] as? [String: Any],
               let opponentName = opponent["opponentName"] as? String,
               let myTurn = opponent["turn"] as? Int,
               let playingAs = opponent["playingAs"] as? Int {
                
                DispatchQueue.main.async {
                    // Проверяем, что playingAs валиден
                    self.playingAs = (playingAs == 0) ? .o : .x
                    self.turn = (myTurn == 0) ? .o : .x
                    self.opponentName = opponentName
                    self.isPlaying = true
                    self.isSearching = false
                    if let playingAsValue = self.playingAs {
                        self.receivedMessage = "Opponent found: \(opponentName), you play as \(playingAsValue.rawValue)"
                        print("Opponent found: \(opponentName), you play as \(playingAsValue.rawValue)")
                    }
                }
            } else {
                print("Error: Invalid data received.")
            }
        }
        
        socket.on("OpponentNotFound") { data, ack in
            // Обработчик для ситуации, когда оппонент не найден
        }
        
        socket.on("playerMoveFromServer") { data, ack in
            if let move = data[0] as? [String: Any],
               let index = move["index"] as? Int,
               let turn = move["turn"] as? Int {
                
                DispatchQueue.main.async {
                    self.gameState[index] = self.playingAs == .x ? "O" : "X"
                    self.turn = (turn == 0) ? .o : .x
                }
            }
        }
    
        socket.on("gameWon") { data, ack in
            if let winnerName = data[0] as? [String: Any], let winner = winnerName["winner"] as? String {
                DispatchQueue.main.async {
                    self.winner = winner
                    self.isPlaying = false
                    self.gameOver = true
                }
                print("\(winner) won the game")
            }
        }
        
        socket.on("gameTied") { data, ack in
            DispatchQueue.main.async {
                self.winner = "Draw"
                self.gameOver = true
                self.isPlaying = false
            }
            print("The game ended in a tie")
        }
        
        socket.on(clientEvent: .disconnect) { data, ack in
            DispatchQueue.main.async {
                self.isConnected = false
            }
            print("Disconnected from server")
        }
    }
    
    func requestToPlay(token: String) {
        reset()
        socket.emit("request_to_play", ["token": token])
        self.isSearching = true
    }
    
    func makeMove(index: Int) {
        if gameState[index] != "" || gameOver || turn != playingAs || !isPlaying {
            return
        }
        
        socket.emit("playerMoveFromClient", ["index": index])
        turn = playingAs == .o ? .x : .o
        // Локально обновляем состояние игры
        gameState[index] = playingAs == .x ? "X" : "O"
    }
}

struct RandomPlayer: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @StateObject private var socketManager = SocketManagerWrapper() // Управление сокетом
    @State private var playerName = ""
    
    @State private var dotCount = 0
    private let maxDotCount = 6
    
    var body: some View {
        ZStack {
            // Градиентный фон
            LinearGradient(gradient: Gradient(colors: [Color(red: 0.1, green: 0.1, blue: 0.3), Color.purple]), startPoint: .top, endPoint: .bottom)
                                .ignoresSafeArea()
            
            VStack {
                Text("Tic-Tac-Toe Game")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.top, 0)
                
                if socketManager.isConnected {
                    Text("Connected to server")
                        .foregroundColor(.green)
                        .padding(.top)
                } else {
                    Text("Not connected")
                        .foregroundColor(.red)
                        .padding(.top)
                }
                
                if let opponentName = socketManager.opponentName {
                    Text("Opponent: \(opponentName)")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding()
                }
                
                if(socketManager.isPlaying) {
                    Text("Playing as: \(socketManager.playingAs?.rawValue ?? ".....")")
                        .foregroundColor(.white)
                        .padding(.top)
                }
                
                if(socketManager.isSearching) {
                    Text("Wait for opponent to join" + String(repeating: ".", count: dotCount))
                        .foregroundColor(.white)
                        .padding(.top)
                        .font(.title)
                        .onAppear {
                            // Запускаем анимацию, которая будет увеличивать количество точек
                            startDotAnimation()
                        }
                }
                
                if socketManager.gameOver {
                    Text(socketManager.winner == "Draw" ? "It's a draw!" : "\(socketManager.winner ?? "") wins!")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.yellow)
                        .padding()
                }
                
                if(socketManager.opponentName != nil && socketManager.isPlaying){
                    Text(socketManager.turn == socketManager.playingAs ? "Your Turn" : "Opponent's Turn")
                        .font(.headline)
                        .foregroundColor(socketManager.turn == socketManager.playingAs ? .green : .red)
                        .padding(.top)
                }
                
                VStack {
                    ForEach(0..<3, id: \.self) { row in
                        HStack {
                            ForEach(0..<3, id: \.self) { col in
                                let index = row * 3 + col
                                Button(action: {
                                    socketManager.makeMove(index: index)
                                }) {
                                    Text(socketManager.gameState[index])
                                        .font(.system(size: 50, weight: .bold))
                                        .frame(width: 80, height: 80)
                                        .background(Color.white.opacity(0.7))
                                        .cornerRadius(12)
                                        .foregroundColor(.black)
                                        .shadow(radius: 10)
                                        .disabled( !(socketManager.isPlaying && socketManager.turn == socketManager.playingAs) )
                                    
                                }
                            }
                        }
                    }
                }
                
                if !socketManager.isPlaying && !socketManager.isSearching {
                    Button(action: {
                        socketManager.requestToPlay(token: socketManager.token)
                    }) {
                        Text("Request to Play")
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                            .shadow(radius: 10)
                    }
                }
            }
        }
        .onAppear {
            socketManager.token = appViewModel.token // Получаем token из AppViewModel
            socketManager.connect() // Подключаемся при загрузке экрана
        }
        .onDisappear {
            socketManager.disconnect() // Отключаемся при уходе с экрана
        }
    }
    
    private func startDotAnimation() {
        // Анимация для последовательного появления точек
        Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { timer in
            withAnimation {
                if dotCount < maxDotCount {
                    dotCount += 1
                } else {
                    dotCount = 0 // Сбросить количество точек после 3
                }
            }
        }
    }
}

#Preview {
    RandomPlayer()
}

