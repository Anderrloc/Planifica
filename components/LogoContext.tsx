import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LogoContextType {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  institutionName: string;
  setInstitutionName: (name: string) => void;
  loading: boolean;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const LogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string>('Anderson Mondragon');
  const [loading, setLoading] = useState(true);

  // Fetch settings from Supabase on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('institution_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Table might be empty or not exist, fallback to localStorage
            const localLogo = localStorage.getItem('institution-logo');
            const localName = localStorage.getItem('institution-name') || '';
            setLogo(localLogo);
            setInstitutionName(localName);
          } else {
            console.error('Error fetching settings:', error);
          }
        } else if (data) {
          setLogo(data.logo);
          setInstitutionName(data.name || '');
        }
      } catch (err) {
        console.error('Unexpected error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save to Supabase (and fallback to localStorage) when logo changes
  useEffect(() => {
    if (loading) return;

    const saveLogo = async () => {
      localStorage.setItem('institution-logo', logo || '');
      try {
        await supabase
          .from('institution_settings')
          .upsert({ id: 1, logo: logo }, { onConflict: 'id' });
      } catch (err) {
        console.error('Error saving logo to Supabase:', err);
      }
    };

    saveLogo();
  }, [logo, loading]);

  // Save to Supabase (and fallback to localStorage) when name changes
  useEffect(() => {
    if (loading) return;

    const saveName = async () => {
      localStorage.setItem('institution-name', institutionName);
      try {
        await supabase
          .from('institution_settings')
          .upsert({ id: 1, name: institutionName }, { onConflict: 'id' });
      } catch (err) {
        console.error('Error saving name to Supabase:', err);
      }
    };

    saveName();
  }, [institutionName, loading]);

  return (
    <LogoContext.Provider value={{ logo, setLogo, institutionName, setInstitutionName, loading }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};
