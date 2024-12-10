//
//  ContentView.swift
//  TIc_Tac_Toe
//
//  Created by adil ashirov on 26/11/24.
//

import SwiftUI


struct ContentView: View {
    @EnvironmentObject var appViewModel: AppViewModel
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("App")
            
            Button{
                appViewModel.isLogin = false
            }label:{
                Text("Out")
            }
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
