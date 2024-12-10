import SwiftUI

struct PlayBotGame: View {
    @Environment(\.dismiss) var dismiss // Для закрытия экрана и возврата в главное меню
    @State private var board: [String] = Array(repeating: "", count: 9)
    @State private var currentPlayer: String = "X" // Игрок всегда первый
    @State private var gameOver: Bool = false
    @State private var winner: String?
    @State private var isBotTurn: Bool = false // Флаг для отслеживания, когда ходит бот
    
    var body: some View {
        
        VStack {
            
            
            Text("Играть с ботом")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding()

            // Игровое поле 3x3
            VStack(spacing: 10) {
                ForEach(0..<3) { row in
                    HStack(spacing: 10) {
                        ForEach(0..<3) { col in
                            let index = row * 3 + col
                            Button(action: {
                                self.makeMove(at: index)
                            }) {
                                Text(self.board[index])
                                    .font(.system(size: 40))
                                    .fontWeight(.bold)
                                    .frame(width: 80, height: 80)
                                    .background(Color.gray.opacity(0.2))
                                    .foregroundColor(.black)
                                    .cornerRadius(10)
                            }
                            .disabled(board[index] != "" || gameOver || isBotTurn) // Блокировка кнопки, пока ходит бот
                        }
                    }
                }
            }
            .padding()

            if gameOver {
                Text(winner == nil ? "Ничья!" : "\(winner!) выиграл!")
                    .font(.title)
                    .fontWeight(.bold)
                    .padding()

                Button("Новая игра") {
                    self.startNewGame()
                }
                .font(.title2)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }

            // Кнопка для возврата в главное меню
            Button("Назад в меню") {
                dismiss() // Закрывает текущий экран и возвращает в главное меню
            }
            .font(.title2)
            .padding()
            .background(Color.red)
            .foregroundColor(.white)
            .cornerRadius(10)
            .padding(.top, 20)
        }
        .padding()
        .onChange(of: currentPlayer) { _ in
            if currentPlayer == "O" && !gameOver {
                // Ход бота
                DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                    self.botMove()
                }
            }
        }
        .onAppear {
            // Начальный ход делает игрок
            if currentPlayer == "X" && !gameOver {
                isBotTurn = false // Игрок ходит первым
            }
        }
    }
    
    // Выполнение хода игрока
    func makeMove(at index: Int) {
        if board[index] == "" && !gameOver && !isBotTurn {
            board[index] = currentPlayer
            if checkWin(for: currentPlayer) {
                winner = currentPlayer
                gameOver = true
            } else if board.contains("") {
                currentPlayer = "O" // После хода игрока ходит бот
                isBotTurn = true // Устанавливаем флаг, что сейчас ходит бот
            } else {
                gameOver = true // Ничья
            }
        }
    }
    
    // Логика для бота
    func botMove() {
        let availableMoves = board.indices.filter { board[$0] == "" }
        
        if let randomIndex = availableMoves.randomElement() {
            board[randomIndex] = "O"
            if checkWin(for: "O") {
                winner = "O"
                gameOver = true
            } else {
                currentPlayer = "X" // После хода бота ходит игрок
                isBotTurn = false // Устанавливаем флаг, что теперь ходит игрок
            }
        }
    }
    
    // Проверка на победу
    func checkWin(for player: String) -> Bool {
        let winningPatterns: [[Int]] = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтали
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикали
            [0, 4, 8], [2, 4, 6]             // Диагонали
        ]
        
        return winningPatterns.contains { pattern in
            pattern.allSatisfy { index in
                board[index] == player
            }
        }
    }
    
    // Сброс игры
    func startNewGame() {
        board = Array(repeating: "", count: 9)
        currentPlayer = "X"
        gameOver = false
        winner = nil
        isBotTurn = false // Сброс флага
    }
}

#Preview {
    PlayBotGame()
}

