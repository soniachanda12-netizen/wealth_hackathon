import React from 'react';
import './App.css';
import { AuthProvider } from './AuthContextSimple';
import SimpleLogin from './components/SimpleLogin';
import MainDashboard from './components/MainDashboard';

function App() {
  return (
    <AuthProvider>
      <SimpleLogin>
        <MainDashboard />
      </SimpleLogin>
    </AuthProvider>
  );
}

export default App;
