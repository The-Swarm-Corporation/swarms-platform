export interface Bookmark {
  id: string;
  type: 'prompt' | 'agent' | 'tool' | 'user';
  name: string;
  description?: string;
  username?: string;
  created_at: string;
  tags?: string[];
}

export const addBookmark = (bookmark: Bookmark) => {
  const storedBookmarks = localStorage.getItem('bookmarks');
  const bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
  
  // Check if bookmark already exists
  const exists = bookmarks.some((b: Bookmark) => b.id === bookmark.id && b.type === bookmark.type);
  if (exists) return false;
  
  bookmarks.push(bookmark);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  return true;
};

export const removeBookmark = (id: string, type: string) => {
  const storedBookmarks = localStorage.getItem('bookmarks');
  if (!storedBookmarks) return false;
  
  const bookmarks = JSON.parse(storedBookmarks);
  const updatedBookmarks = bookmarks.filter((b: Bookmark) => !(b.id === id && b.type === type));
  localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  return true;
};

export const isBookmarked = (id: string, type: string) => {
  const storedBookmarks = localStorage.getItem('bookmarks');
  if (!storedBookmarks) return false;
  
  const bookmarks = JSON.parse(storedBookmarks);
  return bookmarks.some((b: Bookmark) => b.id === id && b.type === type);
};

export const getBookmarks = () => {
  const storedBookmarks = localStorage.getItem('bookmarks');
  return storedBookmarks ? JSON.parse(storedBookmarks) : [];
}; 