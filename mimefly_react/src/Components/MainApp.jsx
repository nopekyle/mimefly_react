import React, { useState, useEffect } from 'react';
import SplashScreen from './Splash';
import App from '../App';

function MainApp() {
  const [appLoaded, setAppLoaded] = useState(false);

  // Simulate app loading 
  useEffect(() => {
    setTimeout(() => {
      setAppLoaded(true);
    }, 1000); // Simulate a 2-second loading time
  }, []);

  return appLoaded ? <App appLoaded={true} /> : <SplashScreen />;
}

export default MainApp;
