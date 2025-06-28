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
        <Header />
        <div className="content_area">
          <AppRoutes />
        </div>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}


export default App;
