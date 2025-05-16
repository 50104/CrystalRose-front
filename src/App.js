import '../src/App.css';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="web">
      <div className="web_div">
        <Header />
        <AppRoutes />
        <Footer />
      </div>
    </div>
  );
}

export default App;