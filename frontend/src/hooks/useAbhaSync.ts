import { useState } from 'react';
import axios from 'axios';

interface UseAbhaSyncReturn {
  processDocument: (file: File) => Promise<any>;
  saveToFHIR: (data: any) => Promise<any>;
  getDrugMapping: (brandName: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const useAbhaSync = (): UseAbhaSyncReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processDocument = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/ocr-process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process document';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveToFHIR = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/fhir-save', data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save to FHIR';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getDrugMapping = async (brandName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/drug-map?brand=${encodeURIComponent(brandName)}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get drug mapping';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processDocument,
    saveToFHIR,
    getDrugMapping,
    isLoading,
    error,
  };
};