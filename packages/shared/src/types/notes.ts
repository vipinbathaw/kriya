export interface Note {
  id: string;
  userId: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  description?: string;
}

export interface UpdateNoteInput {
  title?: string;
  description?: string;
}
