import './assets/global.css';
import HomeAuthentication from './screens/pages/home/authentication';
import ReviewAndRatingsAuthentication from './screens/pages/review-and-ratings/authentication';

function App() {
  return (
    <main className="app-shell">
      <HomeAuthentication />
      <ReviewAndRatingsAuthentication />
    </main>
  );
}

export default App;
