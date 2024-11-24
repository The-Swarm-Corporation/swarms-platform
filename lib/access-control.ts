// lib/access-control.ts
interface Document {
    user_id: string;
    permissions: {
      can_read: string[];
      can_write: string[];
      can_delete: string[];
      is_public: boolean;
    };
}
  
export const AccessControl = {
    canRead(document: Document, userId: string): boolean {
      return (
        document.user_id === userId ||
        document.permissions.can_read.includes(userId) ||
        document.permissions.is_public
      );
    },
  
    canWrite(document: Document, userId: string): boolean {
      return document.user_id === userId || document.permissions.can_write.includes(userId);
    },
  
    canDelete(document: Document, userId: string): boolean {
      return document.user_id === userId || document.permissions.can_delete.includes(userId);
    }
};