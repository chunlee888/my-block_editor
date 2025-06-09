import React, { useRef, useEffect, useCallback } from 'react';
import { Block, BlockId } from '../types';

interface BlockItemProps {
  block: Block;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  updateBlockContent: (id: BlockId, content: string) => void;
  toggleEditMode: (id: BlockId) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  updateBlockContent,
  toggleEditMode,
  isDragging,
  dragOverIndex,
}) => {
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (block.isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.tagName === 'TEXTAREA') {
        const textarea = inputRef.current as HTMLTextAreaElement;
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }
  }, [block.isEditing]);

  const beingDragged = isDragging && block.id === sessionStorage.getItem('draggedBlockId');
  const isDragOver = dragOverIndex === index;

  const getItemStyle = useCallback(() => {
    let baseStyles = "user-select-none p-4 mb-2 border rounded-lg flex flex-col gap-2 transition-all duration-200 ease-in-out font-inter ";
    baseStyles += "bg-white shadow-sm border-gray-200 ";
    if (beingDragged) {
      baseStyles += "opacity-50 border-blue-400 bg-blue-100 ";
    } else if (isDragOver) {
      baseStyles += "bg-blue-50 border-blue-400 ring-2 ring-blue-300 ";
    } else if (block.isEditing) {
      baseStyles += "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300 ";
    }
    return baseStyles;
  }, [beingDragged, isDragOver, block.isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !(e.shiftKey && block.type === 'text')) {
      e.preventDefault();
      toggleEditMode(block.id);
    } else if (e.key === 'Escape') {
      toggleEditMode(block.id);
    }
  };

  const renderBlockContent = (block: Block) => {
    if (block.isEditing) {
      if (block.type === 'heading') {
        return (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={block.content}
            onChange={(e) => updateBlockContent(block.id, e.target.value)}
            onBlur={() => toggleEditMode(block.id)}
            onKeyDown={handleKeyDown}
            className="text-xl font-semibold text-gray-900 w-full bg-transparent border-none focus:outline-none focus:ring-0"
          />
        );
      }
      if (block.type === 'text') {
        return (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={block.content}
            onChange={(e) => updateBlockContent(block.id, e.target.value)}
            onBlur={() => toggleEditMode(block.id)}
            onKeyDown={handleKeyDown}
            className="text-gray-800 text-base leading-relaxed w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
            rows={Math.max(2, block.content.split('\n').length)}
          />
        );
      }
    }

    switch (block.type) {
      case 'text':
        return <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{block.content}</p>;
      case 'heading':
        return <h2 className="text-xl font-semibold text-gray-900">{block.content}</h2>;
      case 'image':
        return (
          <img
            src={block.content}
            alt="Block content"
            className="max-w-full h-auto rounded-md object-cover shadow-sm"
            style={{ maxHeight: '180px', width: 'auto' }}
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/150x150/e0e0e0/555555?text=Image+Error`;
            }}
          />
        );
      default:
        return <p className="text-red-500">Unknown block type</p>;
    }
  };

  return (
    <div
      draggable={!block.isEditing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragLeave={onDragLeave}
      className={getItemStyle()}
      data-block-id={block.id}
      onDoubleClick={() => {
        if (block.type === 'text' || block.type === 'heading') {
          toggleEditMode(block.id);
        }
      }}
    >
      {renderBlockContent(block)}
      <small className="text-gray-500 text-xs">
        {block.type !== 'image' && 'Double-click to edit | '}Block ID: {block.id.substring(0, 8)}...
      </small>
    </div>
  );
};

export default BlockItem;