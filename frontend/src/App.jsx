import { AuthProvider } from './context/AuthProvider';
import Header from './components/Header';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        
        <main className="app-main">
          <Home />
        </main>

        <footer className="app-footer">
          <p>Made by <span className="creator-name">Anirudh</span></p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
