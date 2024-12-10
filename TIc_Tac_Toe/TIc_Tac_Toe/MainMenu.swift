import SwiftUI

struct MainMenu: View {
    
    @EnvironmentObject var appViewModel: AppViewModel
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Фон экрана
                LinearGradient(gradient: Gradient(colors: [Color(red: 0.1, green: 0.1, blue: 0.3), Color.purple]), startPoint: .top, endPoint: .bottom)
                                    .ignoresSafeArea()

                VStack {
                    Spacer()
                    
                    // Заголовок, выровненный по центру
                    Text("Добро пожаловать в Крестики-Нолики! \(appViewModel.name)")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center) // Выравнивание текста по центру
                        .padding(.top, 50) // Добавим отступ сверху
                    
                
                    
                    Spacer()

                    // Кнопки меню
                    VStack(spacing: 20) {
                        // Кнопка "Играть"
                        NavigationLink(destination: MenuGame().environmentObject(appViewModel)) {
                            Text("Играть")
                                .font(.title)
                                .bold()
                                .frame(width: 250, height: 60)
                                .background(Color.white.opacity(0.8))
                                .cornerRadius(15)
                                .foregroundColor(.blue)
                                .shadow(radius: 10)
                        }

                        // Кнопка "Рейтинг"
                        NavigationLink(destination: RatingPage().environmentObject(appViewModel)) {
                            Text("Рейтинг")
                                .font(.title)
                                .bold()
                                .frame(width: 250, height: 60)
                                .background(Color.white.opacity(0.8))
                                .cornerRadius(15)
                                .foregroundColor(.blue)
                                .shadow(radius: 10)
                        }

                        // Кнопка "История"
                        NavigationLink(destination: HistoryPage().environmentObject(appViewModel)) {
                            Text("История")
                                .font(.title)
                                .bold()
                                .frame(width: 250, height: 60)
                                .background(Color.white.opacity(0.8))
                                .cornerRadius(15)
                                .foregroundColor(.blue)
                                .shadow(radius: 10)
                        }
                        Button("Выйти") {
                            appViewModel.name = ""
                            appViewModel._id = ""
                            appViewModel.email = ""
                            appViewModel.token = ""
                            appViewModel.isLogin = false
                            
                        }
                        .font(.title)
                        .bold()
                        .frame(width: 250, height: 60)
                        .background(Color.white.opacity(0.8))
                        .cornerRadius(15)
                        .foregroundColor(.blue)
                        .shadow(radius: 10)
                    }

                    Spacer()
                }
            }
        }
    }
}

// Пример экранов, на которые можно переходить
struct GameView: View {
    var body: some View {
        VStack {
            Text("Игра начнется!")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("Игра")
    }
}

struct RatingView: View {
    var body: some View {
        VStack {
            Text("Рейтинг игроков")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("Рейтинг")
    }
}

struct HistoryView: View {
    var body: some View {
        VStack {
            Text("История игр")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("История")
    }
}

#Preview {
    MainMenu()
}

