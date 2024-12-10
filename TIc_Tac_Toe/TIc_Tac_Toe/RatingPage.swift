import SwiftUI

struct RatingPage: View {
    @EnvironmentObject var appViewModel: AppViewModel
    @State private var users: [User] = []  // Список пользователей
    @State private var isLoading = true  // Флаг загрузки
    @State private var errorMessage: String? = nil  // Сообщение об ошибке
    
    // Структура для отображения данных о пользователе
    struct User: Identifiable, Decodable {
        var id: String
        var name: String
        var ranking: Int
        var rating: Int
        
        // Используем CodingKeys, чтобы корректно маппировать поле "_id" на "id"
        enum CodingKeys: String, CodingKey {
            case id = "_id"
            case name
            case ranking
            case rating
        }
    }
    
    // Структура для обертки данных (для ключа "list")
    struct Response: Decodable {
        var list: [User]
    }
    
    // Функция для получения данных с сервера
    func fetchRatingData() {
        print(appViewModel.token)
        guard !appViewModel.token.isEmpty else {
            self.errorMessage = "No token found"
            self.isLoading = false
            return
        }
        
        let url = URL(string: "http://localhost:9001/user/rating")!
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
            
            // Печать сырых данных для отладки
            print(String(data: data, encoding: .utf8) ?? "Invalid data")
            
            // Проверка на корректность HTTP-статуса
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode != 200 {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "Server error, status code: \(httpResponse.statusCode)"
                }
                return
            }
            
            do {
                // Декодируем данные с использованием структуры Response
                let decodedResponse = try JSONDecoder().decode(Response.self, from: data)
                
                DispatchQueue.main.async {
                    self.users = decodedResponse.list
                    self.isLoading = false
                }
                
            } catch {
                DispatchQueue.main.async {
                    self.isLoading = false
                    self.errorMessage = "Error decoding data: \(error.localizedDescription)"
                }
            }
        }.resume()
    }
    
    var body: some View {
        NavigationView {
            VStack {
                
                
                if isLoading {
                    ProgressView("Loading...")
                        .progressViewStyle(CircularProgressViewStyle(tint: .blue))
                        .padding()
                } else if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding()
                } else {
                    List(users) { user in
                        VStack(alignment: .leading) {
                            HStack {
                                Text("\(user.ranking). \(user.name)")
                                    .font(.headline)
                                Spacer()
                                Text("Rating: \(user.rating)")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        }
                        .padding()
                        .background( Color.white)
                        .cornerRadius(12)
                        .shadow(radius: 5)
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Top Players")
            .onAppear {
                fetchRatingData()  // Загружаем данные при появлении страницы
            }
        }
    }
}

#Preview {
    RatingPage()
        .environmentObject(AppViewModel())  // Пример для предпросмотра
}

