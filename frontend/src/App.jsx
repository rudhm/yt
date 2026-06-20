import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="app">
          <Header />
          
          <main className="app-main">
            <Home />
          </main>

          <footer className="app-footer">
            <p>Made by <span className="creator-name">Anirudh</span></p>
          </footer>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
