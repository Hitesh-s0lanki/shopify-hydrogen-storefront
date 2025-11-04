import {Store, FileText, Contact, List} from 'lucide-react';

export function getMenuItemIcon(title: string) {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('collection')) return <Store className="size-4" />;
  if (titleLower.includes('blog')) return <FileText className="size-4" />;
  if (titleLower.includes('policy')) return <FileText className="size-4" />;
  if (titleLower.includes('about')) return <FileText className="size-4" />;
  if (titleLower.includes('contact')) return <Contact className="size-4" />;
  if (titleLower.includes('catalog')) return <List className="size-4" />;
  return <Store className="size-4" />;
}
