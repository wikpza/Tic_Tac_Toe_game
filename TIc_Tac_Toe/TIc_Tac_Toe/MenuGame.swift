import SwiftUI

struct MenuGame: View {
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
                    Text("Меню игры")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                        .padding(.top, 50)
                    
                    Spacer()

                    // Кнопки меню
                    VStack(spacing: 15) {
                        // Кнопка "Случайный соперник"
                        NavigationLink(destination: RandomPlayer().environmentObject(appViewModel)) {
                            Text("Случайный соперник")
                                .font(.title3)  // Уменьшаем размер шрифта, чтобы текст помещался
                                .bold()
                                .frame(width: 250, height: 60)
                                .background(Color.white.opacity(0.8))
                                .cornerRadius(15)
                                .foregroundColor(.blue)
                                .shadow(radius: 10)
                                .lineLimit(1) // Ограничиваем текст одной строкой
                                .minimumScaleFactor(0.5) // Позволяем тексту уменьшаться, чтобы поместиться
                        }

                        // Кнопка "Создать приватную комнату"
//                        NavigationLink(destination: CreatePrivateRoomView()) {
//                            Text("Создать приватную")
//                                .font(.title3)  // Уменьшаем размер шрифта
//                                .bold()
//                                .frame(width: 250, height: 60)
//                                .background(Color.white.opacity(0.8))
//                                .cornerRadius(15)
//                                .foregroundColor(.blue)
//                                .shadow(radius: 10)
//                                .lineLimit(1)
//                                .minimumScaleFactor(0.5)
//                        }

                        // Кнопка "Присоединиться в приватную комнату"
//                        NavigationLink(destination: JoinPrivateRoomView()) {
//                            Text("Зайти в приватную")
//                                .font(.title3)  // Уменьшаем размер шрифта
//                                .bold()
//                                .frame(width: 250, height: 60)
//                                .background(Color.white.opacity(0.8))
//                                .cornerRadius(15)
//                                .foregroundColor(.blue)
//                                .shadow(radius: 10)
//                                .lineLimit(1)
//                                .minimumScaleFactor(0.5)
//                        }

                        // Кнопка "Играть с ботом"
                        NavigationLink(destination: PlayBotGame()) {
                            Text("Играть с ботом")
                                .font(.title3)  // Уменьшаем размер шрифта
                                .bold()
                                .frame(width: 250, height: 60)
                                .background(Color.white.opacity(0.8))
                                .cornerRadius(15)
                                .foregroundColor(.blue)
                                .shadow(radius: 10)
                                .lineLimit(1)
                                .minimumScaleFactor(0.5)
                        }
                    }
                    .padding(.bottom, 50) // Добавим отступ снизу, чтобы кнопки не прижимались к низу экрана

                    Spacer()
                }
            }
           
        }
    }
}

// Пример экранов, на которые можно переходить

struct RandomOpponentView: View {
    var body: some View {
        VStack {
            Text("Игра с случайным соперником")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("Случайный соперник")
    }
}

struct CreatePrivateRoomView: View {
    var body: some View {
        VStack {
            Text("Создание приватной комнаты")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("Создать комнату")
    }
}

struct JoinPrivateRoomView: View {
    var body: some View {
        VStack {
            Text("Присоединение в приватную комнату")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("Присоединиться")
    }
}

struct PlayWithBotView: View {
    var body: some View {
        VStack {
            Text("Играть с ботом")
                .font(.largeTitle)
                .padding()
        }
        .navigationTitle("Играть с ботом")
    }
}

#Preview {
    MenuGame()
}

