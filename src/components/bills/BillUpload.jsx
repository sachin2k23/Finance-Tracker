import React, { useState } from 'react';
import './BillUpload.css';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Upload, FileImage, FileText, Check, CreditCard as Edit, Save, ArrowLeft } from 'lucide-react';

export const BillUpload = ({ onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [bills, setBills] = useState([]);
  const [extractedData, setExtractedData] = useState({
    billNumber: '',
    date: '',
    vendor: '',
    amount: 0,
    tax: 0,
    items: [{ name: '', quantity: 1, price: 0 }]
  });
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    if (user) {
      setBills(StorageService.getBills(user.id));
    }
  }, [user]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setTimeout(() => {
        setExtractedData({
          billNumber: `BILL-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          vendor: 'Sample Vendor Inc.',
          amount: 1250,
          tax: 225,
          items: [
            { name: 'Office Supplies', quantity: 1, price: 1000 },
            { name: 'Printing Services', quantity: 1, price: 250 }
          ]
        });
        setStep('extract');
        setIsEditing(true);
      }, 1500);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type.includes('image') || file.type.includes('pdf'))) {
      setUploadedFile(file);
      // Simulate extraction
      setTimeout(() => {
        setExtractedData({
          billNumber: `BILL-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          vendor: 'Sample Vendor Inc.',
          amount: 1250,
          tax: 225,
          items: [
            { name: 'Office Supplies', quantity: 1, price: 1000 },
            { name: 'Printing Services', quantity: 1, price: 250 }
          ]
        });
        setStep('extract');
        setIsEditing(true);
      }, 1500);
    }
  };

  const saveBill = () => {
    if (user && uploadedFile) {
      const newBill = {
        id: Date.now().toString(),
        fileName: uploadedFile.name,
        fileType: uploadedFile.type,
        uploadDate: new Date().toISOString(),
        status: 'draft',
        extractedData,
        userId: user.id
      };

      StorageService.addBill(newBill);
      setBills(prev => [...prev, newBill]);
      setIsEditing(false);
    }
  };

  const approveBill = (billId) => {
    StorageService.updateBill(billId, { status: 'approved' });
    setBills(prev => prev.map(bill => 
      bill.id === billId ? { ...bill, status: 'approved' } : bill
    ));
    
    // Auto-create transaction
    const bill = bills.find(b => b.id === billId);
    if (bill && bill.extractedData && user) {
      const transaction = {
        id: Date.now().toString(),
        type: 'expense',
        amount: bill.extractedData.amount,
        description: `Bill from ${bill.extractedData.vendor}`,
        category: 'Business Expense',
        date: bill.extractedData.date,
        billId: bill.id,
        userId: user.id
      };
      StorageService.addTransaction(transaction);
    }
  };

  if (step === 'upload') {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Upload Bills & Invoices</h1>
          <Button onClick={() => setStep('history')} variant="outline">
            View History
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Bill/Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="file-upload-area"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="file-upload-icon" />
                <h3 className="file-upload-title">
                  Drop your files here or click to browse
                </h3>
                <p className="file-upload-subtitle">
                  Supports JPG, PNG, PDF files up to 10MB
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <Button variant="outline">
                  <Upload style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              {bills.slice(0, 5).map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg mb-3" style={{ marginBottom: bills.indexOf(bill) === bills.slice(0, 5).length - 1 ? 0 : '0.75rem' }}>
                  <div className="flex items-center space-x-3">
                    {bill.fileType.includes('image') ? (
                      <FileImage style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} />
                    ) : (
                      <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--error-color)' }} />
                    )}
                    <div>
                      <p className="font-medium text-sm">{bill.fileName}</p>
                      <p className="text-sm" style={{ color: 'var(--secondary-color)', fontSize: '0.75rem' }}>
                        {new Date(bill.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`status-badge ${bill.status === 'approved' ? 'green' : 'yellow'}`}>
                      {bill.status}
                    </span>
                    {bill.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => approveBill(bill.id)}
                        style={{ fontSize: '0.75rem' }}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {bills.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--secondary-color)' }}>No bills uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'extract') {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setStep('upload')}>
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Back
          </Button>
          <h1 className="text-3xl font-bold">AI Extraction Result</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Bill Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Original Bill</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
                {uploadedFile?.type.includes('image') ? (
                  <FileImage style={{ width: '4rem', height: '4rem', color: 'var(--secondary-color)', margin: '0 auto 1rem' }} />
                ) : (
                  <FileText style={{ width: '4rem', height: '4rem', color: 'var(--secondary-color)', margin: '0 auto 1rem' }} />
                )}
                <p className="font-medium">{uploadedFile?.name}</p>
                <p className="text-sm mt-2" style={{ color: 'var(--secondary-color)' }}>
                  AI extraction completed with 95% confidence
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Data Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Extracted Information</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bill Number"
                  value={extractedData.billNumber}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, billNumber: e.target.value }))}
                  disabled={!isEditing}
                />
                <Input
                  label="Date"
                  type="date"
                  value={extractedData.date}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, date: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <Input
                label="Vendor/Customer"
                value={extractedData.vendor}
                onChange={(e) => setExtractedData(prev => ({ ...prev, vendor: e.target.value }))}
                disabled={!isEditing}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount"
                  type="number"
                  value={extractedData.amount}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  disabled={!isEditing}
                />
                <Input
                  label="Tax"
                  type="number"
                  value={extractedData.tax}
                  onChange={(e) => setExtractedData(prev => ({ ...prev, tax: Number(e.target.value) }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="input-label mb-2">Items</label>
                {extractedData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...extractedData.items];
                        newItems[index].name = e.target.value;
                        setExtractedData(prev => ({ ...prev, items: newItems }));
                      }}
                      disabled={!isEditing}
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...extractedData.items];
                        newItems[index].quantity = Number(e.target.value);
                        setExtractedData(prev => ({ ...prev, items: newItems }));
                      }}
                      disabled={!isEditing}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...extractedData.items];
                        newItems[index].price = Number(e.target.value);
                        setExtractedData(prev => ({ ...prev, items: newItems }));
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <Button onClick={saveBill} style={{ flex: 1 }}>
                  <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Save Draft
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    saveBill();
                    setTimeout(() => {
                      const savedBill = bills[bills.length - 1];
                      if (savedBill) {
                        approveBill(savedBill.id);
                      }
                    }, 100);
                  }}
                  style={{ flex: 1 }}
                >
                  <Check style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  Save & Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Bill History
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bill History</h1>
        <Button onClick={() => setStep('upload')}>
          <Upload style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          Upload New Bill
        </Button>
      </div>

      <Card>
        <CardContent style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        {bill.fileType.includes('image') ? (
                          <FileImage style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-color)' }} />
                        ) : (
                          <FileText style={{ width: '1.25rem', height: '1.25rem', color: 'var(--error-color)' }} />
                        )}
                        <div>
                          <p className="font-medium text-sm">{bill.fileName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--secondary-color)' }}>{bill.extractedData?.billNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{bill.extractedData?.vendor || '-'}</td>
                    <td className="text-sm font-medium">
                      {bill.extractedData ? `₹${bill.extractedData.amount}` : '-'}
                    </td>
                    <td className="text-sm">
                      {bill.extractedData ? new Date(bill.extractedData.date).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${bill.status === 'approved' ? 'green' : 'yellow'}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      {bill.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => approveBill(bill.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bills.length === 0 && (
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <p className="empty-state-text">No bills uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};