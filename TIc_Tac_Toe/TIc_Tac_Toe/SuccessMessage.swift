import SwiftUI

struct SuccessMessage: View {
    
    @EnvironmentObject var appViewModel: AppViewModel
    
    var body: some View {
        ZStack {
            // Фоновый цвет (градиент)
            LinearGradient(gradient: Gradient(colors: [Color.blue, Color.purple]), startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            
            VStack {
                Spacer()
                
                // Заголовок
                Text("Письмо отправлено!")
                    .font(.system(size: 34, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.bottom, 20)
                
                // Сообщение
                Text("Мы успешно отправили вам письмо. Пожалуйста, проверьте вашу почту и следуйте инструкциям.")
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding(.horizontal, 30)
                    .multilineTextAlignment(.center)
                
                Spacer()
                
                NavigationLink(destination: LoginPage().environmentObject(appViewModel)) {
                    Text("Назад на главную")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.red)
                        .cornerRadius(10)
                        .shadow(radius: 10)
                }

               
                .padding(.bottom, 50)
            }
        }
    }
}

#Preview {
    SuccessMessage()
}

