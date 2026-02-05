import { toast as baseToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    baseToast.success(message, {
      description,
      duration: 3000,
    });
  },
  
  error: (message: string, description?: string) => {
    baseToast.error(message, {
      description,
      duration: 4000,
    });
  },
  
  warning: (message: string, description?: string) => {
    baseToast.warning(message, {
      description,
      duration: 3500,
    });
  },
  
  info: (message: string, description?: string) => {
    baseToast.info(message, {
      description,
      duration: 3000,
    });
  },
  
  loading: (message: string) => {
    return baseToast.loading(message);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return baseToast.promise(promise, msgs);
  },
};
