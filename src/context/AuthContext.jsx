import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('finance-tracker-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    // Mock authentication - in real app, this would be an API call
    const users = JSON.parse(localStorage.getItem('finance-tracker-users') || '[]');
    const foundUser = users.find((u) => 
      u.email === email && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('finance-tracker-user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const signup = async (email, password, name, role) => {
    const users = JSON.parse(localStorage.getItem('finance-tracker-users') || '[]');
    
    if (users.find((u) => u.email === email)) {
      return false; // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      role,
      companyName: '',
      companyLogo: ''
    };

    const { password: _, ...userWithoutPassword } = newUser;
    users.push(newUser);
    localStorage.setItem('finance-tracker-users', JSON.stringify(users));
    
    setUser(userWithoutPassword);
    localStorage.setItem('finance-tracker-user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('finance-tracker-user');
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('finance-tracker-user', JSON.stringify(updatedUser));
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('finance-tracker-users') || '[]');
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        localStorage.setItem('finance-tracker-users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};