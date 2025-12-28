import React, { createContext, useState, useContext, useEffect } from 'react';
import { initDatabase, createUser, getUser, addPlatform } from '../database/db';
import { colors } from '../theme';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initDatabase();
      setDbInitialized(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, name) => {
    try {
      let userData = await getUser(email);

      if (!userData) {
        const userId = await createUser(email, name);
        userData = { id: userId, email, name };

        // Add default platforms
        await addPlatform(userId, 'DoorDash', colors.doordash);
        await addPlatform(userId, 'UberEats', colors.ubereats);
        await addPlatform(userId, 'Grubhub', colors.grubhub);
        await addPlatform(userId, 'Spark Driver', colors.spark);
      }

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading, dbInitialized }}>
      {children}
    </UserContext.Provider>
  );
};
