import '../src/App.css';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="web">
        <div className="web_div">
          <Header />
          <AppRoutes />
          <Footer />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
