import SwiftUI

struct RegistrationPage: View {
    @EnvironmentObject var appViewModel: AppViewModel
    
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var passwordCopy = ""
    
    @State private var wrongUsername: Float = 0
    @State private var wrongPassword: Float = 0
    @State private var wrongPasswordCopy: Float = 0
    
    @State private var showingMailScreen = false
    
    @State private var showError = false
    @State private var errorMessage = "Error"
    
    // Состояние для перехода на SuccessMessage
    @State private var isRegistrationSuccessful = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(gradient: Gradient(colors: [Color(red: 0.1, green: 0.1, blue: 0.3), Color.purple]), startPoint: .top, endPoint: .bottom)
                    .ignoresSafeArea()
                
                Circle()
                    .scale(1.7)
                    .foregroundColor(.white.opacity(0.15))
                
                Circle()
                    .scale(1.35)
                    .foregroundColor(.white)
                
                VStack {
                    Text("Registration")
                        .font(.largeTitle)
                        .bold()
                        .padding(40)
                    
                    if showError {
                        Text(errorMessage)
                            .bold()
                            .padding()
                            .foregroundColor(.red)
                            .transition(.opacity) // Плавное исчезновение ошибки
                    }
                    
                    TextField("Name", text: $name)
                        .padding()
                        .frame(width: 300, height: 50)
                        .background(Color.black.opacity(0.05))
                        .cornerRadius(10)
                        .autocapitalization(.none)
                        .border(.red, width: CGFloat(wrongUsername))
                    
                    TextField("Email", text: $email)
                        .padding()
                        .frame(width: 300, height: 50)
                        .background(Color.black.opacity(0.05))
                        .cornerRadius(10)
                        .autocapitalization(.none)
                    
                    TextField("Password", text: $password)
                        .padding()
                        .frame(width: 300, height: 50)
                        .background(Color.black.opacity(0.05))
                        .cornerRadius(10)
                        .border(.red, width: CGFloat(wrongPassword))
                    
                    TextField("Confirm Password", text: $passwordCopy)
                        .padding()
                        .frame(width: 300, height: 50)
                        .background(Color.black.opacity(0.05))
                        .cornerRadius(10)
                        .border(.red, width: CGFloat(wrongPasswordCopy))
                    
                    Button("Register") {
                        registrationUser(name: name, email: email, password: password)
                    }
                    .foregroundColor(.white)
                    .frame(width: 300, height: 50)
                    .background(Color.purple)
                    .cornerRadius(10)
                    .padding()
                    
                    // Навигация на страницу успеха после успешной регистрации
                    NavigationLink(destination: SuccessMessage(), isActive: $isRegistrationSuccessful) {
                        EmptyView()
                    }
                    
                    NavigationLink("Already have an account?", destination: LoginPage())
                        .foregroundColor(Color.purple)
                        .background(Color.white)
                }
            }
            .navigationBarHidden(true)
        }
    }
    
    func registrationUser(name: String, email: String, password: String) {
        if(name == "" || email == "" || password == ""){
            showError = true
            errorMessage = "Please fill in all fields"
            
            wrongPassword = 1.0
            wrongPasswordCopy = 1.0
            wrongUsername = 1.0
            return
        }
        
        if( password != passwordCopy){
            showError = true
            errorMessage = "Passwords should be equal"
            wrongPassword = 1.0
            wrongPasswordCopy = 1.0
            return
        }
        
        if( password.count < 8){
            showError = true
            errorMessage = "Password length should be at least 8 characters"
            wrongPassword = 1.0
            wrongPasswordCopy = 1.0
            return
        }
        
        registrationRequest(name: name, email: email, password: password)
    }
    
    func registrationRequest(name: String, email: String, password: String) {
        let url = URL(string: "http://localhost:9001/user/registration")
        var request = URLRequest(url: url!)
        let messageData = RegistrationData(name: name, email: email, password: password)
        let data = try! JSONEncoder().encode(messageData)
        request.httpBody = data
        
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpMethod = "POST"
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            // Если произошла ошибка сети
            if let data = data {
                do {
                    let message = try JSONDecoder().decode(RegistrationResponse.self, from: data)
                    
                    // Успешная регистрация
                    DispatchQueue.main.async {
                        isRegistrationSuccessful = true // Переход на SuccessMessage
                    }
                    
                } catch {
                    DispatchQueue.main.async {
                        showError = true
                        errorMessage = "Registration failed, please try again later."
                    }
                }
            }
            
            if let error = error {
                DispatchQueue.main.async {
                    showError = true
                    errorMessage = "Network error: \(error.localizedDescription)"
                }
                return
            }
            
            // Проверка статуса кода ответа сервера
            if let httpResponse = response as? HTTPURLResponse {
                if httpResponse.statusCode != 200 {
                    DispatchQueue.main.async {
                        showError = true
                        errorMessage = "Registration failed, please try again later."
                    }
                    return
                }
            }
        }
        
        task.resume()
    }
}

#Preview {
    RegistrationPage()
}

