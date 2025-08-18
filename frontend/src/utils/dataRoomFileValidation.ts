
import { toast } from '@/hooks/use-toast';

export const validateDataRoomFiles = (files: FileList): boolean => {
  const maxSize = 50 * 1024 * 1024; // 50MB per file
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `${file.name} exceeds the 50MB limit.`,
        variant: "destructive",
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `${file.name} is not a supported file type.`,
        variant: "destructive",
      });
      return false;
    }
  }

  return true;
};

export const getDataRoomFileName = (filePath: string): string => {
  return filePath.split('/').pop()?.split('_').slice(1).join('_') || filePath;
};
