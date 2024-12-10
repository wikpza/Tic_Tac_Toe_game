import SwiftUI

struct LoginPage: View {
    
    @EnvironmentObject var appViewModel: AppViewModel
    
    @State private var email = ""
    @State private var password = ""
    @State private var wrongUsername: Float = 0
    @State private var wrongPassword: Float = 0
    @State private var showingLoginScreen = false
    
    @State private var showError = false
    @State private var errorMessage = "Error"
    
    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(gradient: Gradient(colors: [Color(red: 0.1, green: 0.1, blue: 0.3), Color.purple]), startPoint: .top, endPoint: .bottom)
                               .ignoresSafeArea()
                
                Circle()
                 .scale(1.7)
                 .foregroundColor(.white.opacity(0.15))
             
             // Более маленькое кольцо с меньшей прозрачностью
             Circle()
                 .scale(1.35)
                 .foregroundColor(.white)
                
                VStack {
                    Text("Login")
                        .font(.largeTitle)
                        .bold()
                        .padding()
                    
                    if showError {
                        Text(errorMessage)
                            .bold()
                            .padding()
                            .foregroundColor(.red)
                            .transition(.opacity) // Плавное исчезновение ошибки
                    }
                    
                    TextField("Email", text: $email)
                        .padding()
                        .frame(width: 300, height: 50)
                        .background(Color.black.opacity(0.05))
                        .cornerRadius(10)
                        .border(.red, width: CGFloat(wrongUsername))
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .padding()
                        .frame(width: 300, height: 50)
                        .background(Color.black.opacity(0.05))
                        .cornerRadius(10)
                        .border(.red, width: CGFloat(wrongPassword))
                    
                    Button("Login") {
                        authenticateUser(email: email, password: password)
                    }
                    .foregroundColor(.white)
                    .frame(width: 300, height: 50)
                    .background(Color.purple)
                    .cornerRadius(10)
                    
                    // Переход на новый экран с помощью NavigationLink
                    NavigationLink("haven't account", destination: RegistrationPage().environmentObject(appViewModel))
                        .foregroundColor(Color.purple)
                        .padding()
                        .background(Color.white)
                        .cornerRadius(10)
                }
            }
            .navigationBarHidden(true)
        }
    }
    
    func authenticateUser(email: String, password: String) {
        loginRequest(email: email, password: password)
    }
    
    func loginRequest(email: String, password: String) {
        guard let url = URL(string: "http://localhost:9001/user/login") else { return }
        var request = URLRequest(url: url)
        let messageData = LoginData(email: email, password: password)
        
        do {
            let data = try JSONEncoder().encode(messageData)
            request.httpBody = data
        } catch {
            DispatchQueue.main.async {
                showError = true
                errorMessage = "Ошибка кодирования данных"
            }
            return
        }
        
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    showError = true
                    errorMessage = "Ошибка сети: \(error.localizedDescription)"
                }
                return
            }
            
            if let data = data {
                do {
                    let message = try JSONDecoder().decode(LoginResponse.self, from: data)
                    DispatchQueue.main.async {
                        extractDataFromJWT(jwtToken: message.token)
                    }
                } catch {
                    DispatchQueue.main.async {
                        showError = true
                        errorMessage = "Не удалось войти, попробуйте позже"
                    }
                }
            }
            
            // Проверка статуса кода ответа сервера
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode != 200 {
                    DispatchQueue.main.async {
                        showError = true
                        errorMessage = "Не удалось войти, попробуйте позже"
                    }
                    
                    if let data = data {
                        if let errorMessageString = String(data: data, encoding: .utf8) {
                            if errorMessageString.count < 20 {
                                DispatchQueue.main.async {
                                    errorMessage = "\(errorMessageString)"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        task.resume()
    }
    
    func extractDataFromJWT(jwtToken: String) {
        guard let payload = decode(jwtToken: jwtToken) else {
            DispatchQueue.main.async {
                showError = true
                errorMessage = "Неверный пароль или почта"
            }
            return
        }
        
        if let id = payload["_id"] as? String {
            appViewModel._id = id
        } else {
            DispatchQueue.main.async {
                showError = true
                errorMessage = "Неверный пароль или почта"
            }
            return
        }
        
        if let name = payload["name"] as? String {
            appViewModel.name = name
        } else {
            DispatchQueue.main.async {
                showError = true
                errorMessage = "Неверный пароль или почта"
            }
            return
        }
        
        if let email = payload["email"] as? String {
            appViewModel.email = email
        } else {
            DispatchQueue.main.async {
                showError = true
                errorMessage = "Неверный пароль или почта"
            }
            return
        }
        
        if appViewModel.email != "" && appViewModel._id != "" && appViewModel.name != "" {
            DispatchQueue.main.async {
                appViewModel.token = jwtToken
                appViewModel.isLogin = true
            }
        }
    }
}


struct LoginPage_Previews: PreviewProvider {
    static var previews: some View {
        LoginPage().environmentObject(AppViewModel())
    }
}
#Preview {
    LoginPage()
}

