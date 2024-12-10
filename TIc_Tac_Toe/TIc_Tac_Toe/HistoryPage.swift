import SwiftUI

struct HistoryPage: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var history: [Match] = []  // Список матчей
    @State private var currentPage = 1  // Текущая страница
    @State private var totalPages = 1  // Общее количество страниц
    @State private var isLoading = true  // Флаг загрузки
    @State private var errorMessage: String? = nil  // Сообщение об ошибке
    
    // Структура для отображения данных о матче
    struct Match: Identifiable, Decodable {
        var id: String  // Модель будет использовать поле id вместо _id
        var player1: Player
        var player2: Player
        var winnerId: String?
        var type: String
        var createdAt: String
        
        struct Player: Decodable {
            var id: String  // Маппинг _id в id
            var name: String
            
            // Маппинг для преобразования _id в id
            private enum CodingKeys: String, CodingKey {
                case id = "_id"   // Это преобразует _id в id для использования в модели
                case name
            }
        }
        
        // Маппинг для декодирования полей с _id в id
        private enum CodingKeys: String, CodingKey {
            case id = "_id"   // Это преобразует _id в id для использования в модели
            case player1
            case player2
            case winnerId
            case type
            case createdAt
        }
    }
    
    // Структура для всего ответа, включающая массив матчей и количество страниц
    struct HistoryResponse: Decodable {
        var list: [Match]
        var totalPages: Int
    }
    
    // Функция для получения данных с сервера
    func fetchHistoryData() {
        guard !appViewModel.token.isEmpty else {
            self.errorMessage = "No token found"
            self.isLoading = false
            return
        }
        
        let url = URL(string: "http://localhost:9001/play?page=\(currentPage)")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("Bearer \(appViewModel.token)", forHTTPHeaderField: "Authorization")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "Error: \(error.localizedDescription)"
                }
                return
            }
            
            guard let data = data else {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "No data received."
                }
                return
            }
            
            // Выводим данные для отладки перед декодированием
            print("Response Data: \(String(data: data, encoding: .utf8) ?? "No data")")
            
            do {
                let decodedResponse = try JSONDecoder().decode(HistoryResponse.self, from: data)
                DispatchQueue.main.async {
                    self.history = decodedResponse.list
                    self.totalPages = decodedResponse.totalPages
                    self.isLoading = false
                }
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "Error decoding data."
                }
                print("Decoding error: \(error.localizedDescription)")
            }
        }.resume()
    }
    
    var body: some View {
        VStack {
            // Заголовок и описание страницы
            Text("Game History")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 20)
            
            Text("Here you can view the history of all your games.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .padding(.bottom, 20)
            
            if isLoading {
                ProgressView("Loading...")
                    .progressViewStyle(CircularProgressViewStyle(tint: .blue))
                    .padding()
            } else if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .padding()
            } else {
                // История игр
                List(history) { match in
                    VStack(alignment: .leading) {
                        HStack {
                            Text("\(match.player1.name) vs \(match.player2.name)")
                                .font(.headline)
                            Spacer()
                            Text(match.type.capitalized)
                                .font(.subheadline)
                                .foregroundColor(match.winnerId == match.player1.id ? .green : .red)
                        }
                        Text("Date: \(match.createdAt)")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(radius: 5)
                }
                .listStyle(PlainListStyle())
                
                // Кнопки навигации (Pagination)
                HStack {
                    Button(action: {
                        if currentPage > 1 {
                            currentPage -= 1
                            fetchHistoryData()
                        }
                    }) {
                        Text("Previous")
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                    .disabled(currentPage == 1)
                    
                    Spacer()
                    
                    Text("Page \(currentPage) of \(totalPages)")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    
                    Spacer()
                    
                    Button(action: {
                        if currentPage < totalPages {
                            currentPage += 1
                            fetchHistoryData()
                        }
                    }) {
                        Text("Next")
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                    .disabled(currentPage == totalPages)
                }
                .padding()
            }
        }
        .navigationTitle("History")
        .onAppear {
            fetchHistoryData()  // Загружаем данные при появлении страницы
        }
        .padding(.horizontal)
    }
}

#Preview {
    HistoryPage()
        .environmentObject(AppViewModel())  // Пример для предпросмотра
}

