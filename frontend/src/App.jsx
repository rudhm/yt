import { AuthProvider } from './context/AuthContext';
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
          <p>Powered by YouTube Data API v3 • Built with React</p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
