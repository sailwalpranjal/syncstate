import { supabase } from './client';
import type { Document } from '@/types';

export async function getDocuments(userId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .or(`owner_id.eq.${userId},is_public.eq.true`)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return data as Document[];
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data as Document;
}

export async function createDocument(title: string, ownerId: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        title,
        owner_id: ownerId,
        is_public: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    return null;
  }

  return data as Document;
}

export async function updateDocument(id: string, title: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating document:', error);
    return null;
  }

  return data as Document;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }

  return true;
}
