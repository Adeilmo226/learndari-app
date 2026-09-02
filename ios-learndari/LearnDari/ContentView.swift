import SwiftUI

/// Root shell — the five LearnDari tabs.
struct ContentView: View {
    var body: some View {
        TabView {
            Tab("Learn", systemImage: "graduationcap.fill") {
                LearnView()
            }
            Tab("Vocab", systemImage: "book.fill") {
                VocabView()
            }
            Tab("Explore", systemImage: "magnifyingglass") {
                ExploreView()
            }
            Tab("Culture", systemImage: "globe") {
                CultureView()
            }
            Tab("Profile", systemImage: "person.fill") {
                ProfileView()
            }
        }
        .tint(Theme.red)
    }
}

#Preview {
    ContentView()
        .environment(ProgressStore())
        .environment(AudioService())
        .environment(ContentService())
}
