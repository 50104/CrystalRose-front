import '../src/App.css';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import AppRoutes from './routes/AppRoutes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { clearServiceWorkerCache, reregisterServiceWorker } from '@utils/axios';

const queryClient = new QueryClient();

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  // 업데이트 감지
  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: (registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
          setWaitingWorker(registration.waiting);
        }
      },
    });
  }, []);

  const reloadPage = async () => {
    const confirm = window.confirm("새 버전이 있습니다. 업데이트 하시겠습니까?");
    if (waitingWorker && confirm) {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        await clearServiceWorkerCache();
        await reregisterServiceWorker();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="web">
        <Header updateAvailable={updateAvailable} reloadPage={reloadPage} />
        <div className="content_area">
          <AppRoutes />
        </div>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
