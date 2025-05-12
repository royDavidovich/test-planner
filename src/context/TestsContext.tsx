import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Test {
  id: string;
  courseName: string;
  date: Date;
  period: 'מועד א' | 'מועד ב';
  color: string;
  source: 'manual' | 'csv';
}

interface TestsContextType {
  tests: Test[];
  addTest: (test: Omit<Test, 'id'>) => void;
  updateTest: (id: string, test: Partial<Test>) => void;
  deleteTest: (id: string) => void;
  hasPeriodForCourse: (courseName: string, period: 'מועד א' | 'מועד ב') => boolean;
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  clearCSVTests: () => void;
}

const TestsContext = createContext<TestsContextType | undefined>(undefined);

export const useTests = () => {
  const context = useContext(TestsContext);
  if (!context) {
    throw new Error('useTests must be used within a TestsProvider');
  }
  return context;
};

export const TestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tests, setTests] = useState<Test[]>(() => {
    const savedTests = localStorage.getItem('tests');
    if (savedTests) {
      return JSON.parse(savedTests, (key, value) => {
        if (key === 'date') return new Date(value);
        return value;
      });
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tests', JSON.stringify(tests));
  }, [tests]);

  const hasPeriodForCourse = (courseName: string, period: 'מועד א' | 'מועד ב'): boolean => {
    return tests.some(test => 
      test.courseName === courseName && test.period === period
    );
  };

  const addTest = (test: Omit<Test, 'id'>) => {
    if (hasPeriodForCourse(test.courseName, test.period)) {
      throw new Error(`קיים כבר מבחן ${test.period} עבור הקורס ${test.courseName}`);
    }
    const newTest: Test = {
      ...test,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTests(prev => [...prev, newTest]);
  };

  const updateTest = (id: string, updatedTest: Partial<Test>) => {
    setTests(prev => prev.map(test => {
      if (test.id === id) {
        // Check for period conflict only if period is being updated
        if (updatedTest.period && updatedTest.period !== test.period) {
          if (hasPeriodForCourse(test.courseName, updatedTest.period)) {
            throw new Error(`קיים כבר מבחן ${updatedTest.period} עבור הקורס ${test.courseName}`);
          }
        }
        return { ...test, ...updatedTest };
      }
      return test;
    }));
  };

  const deleteTest = (id: string) => {
    setTests(prev => prev.filter(test => test.id !== id));
  };

  const clearCSVTests = () => {
    setTests(prev => prev.filter(test => test.source === 'manual'));
  };

  return (
    <TestsContext.Provider value={{ tests, addTest, updateTest, deleteTest, hasPeriodForCourse, setTests, clearCSVTests }}>
      {children}
    </TestsContext.Provider>
  );
};