import Foundation

class AppViewModel:ObservableObject {
    @Published var isLogin: Bool = false
    
    @Published var _id: String = ""
    @Published var name: String = ""
    @Published var email: String = ""
    @Published var token: String = ""
}
