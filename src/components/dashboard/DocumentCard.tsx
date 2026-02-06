'use client';

import Link from 'next/link';
import { FileText, Trash2, GitBranch } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link href={`/editor/${document.id}`} className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                {document.title}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span>Updated {formatDate(document.updated_at)}</span>
              {document.is_public && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </CardDescription>
          </Link>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/visualization/${document.id}`);
              }}
              title="View 3D Version Tree"
            >
              <GitBranch className="w-4 h-4 text-purple-500" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm('Are you sure you want to delete this document?')) {
                    onDelete(document.id);
                  }
                }}
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
