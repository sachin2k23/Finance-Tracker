import React, { useState } from 'react';
import './Settings.css';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  User, 
  Building, 
  Save,
  Upload
} from 'lucide-react';

export const Settings = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'business-owner'
  });

  const [businessData, setBusinessData] = useState({
    companyName: user?.companyName || '',
    companyLogo: user?.companyLogo || '',
    currency: 'INR',
    taxRate: '18',
    financialYear: 'april-march'
  });

  const handleSaveProfile = () => {
    updateUser(profileData);
    alert('Profile updated successfully!');
  };

  const handleSaveBusiness = () => {
    updateUser(businessData);
    alert('Business settings updated successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building }
  ];

  const roleOptions = [
    { value: 'business-owner', label: 'Business Owner' },
    { value: 'accountant', label: 'Accountant' }
  ];

  const currencyOptions = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  const financialYearOptions = [
    { value: 'april-march', label: 'April - March' },
    { value: 'january-december', label: 'January - December' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p style={{ color: 'var(--secondary-color)', marginTop: '0.5rem' }}>Manage your account and business preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div>
          <nav className="settings-sidebar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div style={{ gridColumn: 'span 3' }}>
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>

                <Select
                  label="Role"
                  value={profileData.role}
                  onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                  options={roleOptions}
                />

                {/* Dark Mode Toggle */}
                <div className="settings-item">
                  <div className="settings-item-info">
                    <h3>Dark Mode</h3>
                    <p>Use dark theme for the interface</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={toggleDarkMode}
                    />
                    <div className="toggle-slider"></div>
                  </label>
                </div>

                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Save Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Input
                    label="Company Name"
                    value={businessData.companyName}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter your company name"
                  />

                  <div>
                    <label className="input-label mb-2">
                      Company Logo
                    </label>
                    <div className="company-logo-section">
                      <div className="company-logo-preview">
                        {businessData.companyLogo ? (
                          <img src={businessData.companyLogo} alt="Logo" />
                        ) : (
                          <Building style={{ width: '2rem', height: '2rem', color: 'var(--secondary-color)' }} />
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Currency"
                    value={businessData.currency}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, currency: e.target.value }))}
                    options={currencyOptions}
                  />

                  <Input
                    label="Default Tax Rate (%)"
                    type="number"
                    value={businessData.taxRate}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, taxRate: e.target.value }))}
                    placeholder="18"
                  />
                </div>

                <Select
                  label="Financial Year"
                  value={businessData.financialYear}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, financialYear: e.target.value }))}
                  options={financialYearOptions}
                />

                <Button onClick={handleSaveBusiness} className="w-full md:w-auto">
                  <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Save Business Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};