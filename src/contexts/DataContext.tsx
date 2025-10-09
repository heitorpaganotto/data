import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DailyData {
  id: string;
  date: string;
  revenue: number;
  salesCount: number;
  deliveryRate: number;
  paymentMethod?: 'credit' | 'debit' | 'pix' | 'boleto';
  deliveryType?: 'delivery' | 'pickup' | 'dine-in';
}

interface DataContextType {
  dailyData: DailyData[];
  addDailyData: (data: Omit<DailyData, 'id'>) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateMockData = (): DailyData[] => {
  const paymentMethods: DailyData['paymentMethod'][] = ['credit', 'debit', 'pix', 'boleto'];
  const deliveryTypes: DailyData['deliveryType'][] = ['delivery', 'pickup', 'dine-in'];
  const mockData: DailyData[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    mockData.push({
      id: `data-${i}`,
      date: date.toISOString().split('T')[0],
      revenue: Math.random() * 5000 + 1000,
      salesCount: Math.floor(Math.random() * 50) + 10,
      deliveryRate: Math.random() * 20 + 75,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      deliveryType: deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)],
    });
  }

  return mockData;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [dailyData, setDailyData] = useState<DailyData[]>(() => {
    const stored = localStorage.getItem('dailyData');
    if (stored) {
      return JSON.parse(stored);
    }
    return generateMockData();
  });

  useEffect(() => {
    localStorage.setItem('dailyData', JSON.stringify(dailyData));
  }, [dailyData]);

  const addDailyData = (data: Omit<DailyData, 'id'>) => {
    const newData: DailyData = {
      ...data,
      id: `data-${Date.now()}`,
    };
    setDailyData((prev) => [...prev, newData]);
  };

  const clearData = () => {
    setDailyData([]);
  };

  return (
    <DataContext.Provider value={{ dailyData, addDailyData, clearData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
