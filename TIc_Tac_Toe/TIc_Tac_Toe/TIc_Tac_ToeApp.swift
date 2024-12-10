//
//  TIc_Tac_ToeApp.swift
//  TIc_Tac_Toe
//
//  Created by adil ashirov on 26/11/24.
//

import SwiftUI

@main
struct TIc_Tac_ToeApp: App {
    
    @StateObject var appViewModel = AppViewModel()
    
    var body: some Scene {
        WindowGroup {
            if(appViewModel.isLogin){
                MainMenu()
                    .environmentObject(appViewModel)
            }else{
                LoginPage()
                    .environmentObject(appViewModel)
            }
        }
    }
}


