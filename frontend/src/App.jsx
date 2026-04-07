import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="logo-icon">▶</span>
            My YouTube
          </h1>
          <p className="app-subtitle">No Shorts. No Distractions. Just Videos.</p>
        </div>
      </header>
      
      <main className="app-main">
        <Home />
      </main>

      <footer className="app-footer">
        <p>Powered by YouTube Data API v3 • Built with React</p>
      </footer>
    </div>
  );
}

export default App;
