export type BlockId = string;

export interface Block {
  id: BlockId;
  type: 'text' | 'image' | 'heading';
  content: string;
  isEditing?: boolean;
}