import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// --- Type Definitions ---
// Define the basic structure of a block.
export type BlockId = string;

export interface Block {
  id: BlockId;
  type: 'text' | 'image' | 'heading';
  content: string; // The content of the block (text or image URL)
  isEditing?: boolean; // Optional flag to indicate edit mode
}

// --- BlockItem Component ---
// This component represents a single draggable and editable block.
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

  // Automatically focus the input when entering edit mode
  useEffect(() => {
    if (block.isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to the end of the text
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
      draggable={!block.isEditing} // Disable drag when editing
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

// --- BlockEditor Component ---
const BlockEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(() => [
    { id: uuidv4(), type: 'heading', content: 'Notion-like Document (Native D&D)' },
    { id: uuidv4(), type: 'text', content: 'This is a paragraph. You can reorder these blocks by dragging them up or down. Double-click text or headings to edit them!' },
    { id: uuidv4(), type: 'image', content: 'https://placehold.co/200x150/d3d3d3/555555?text=Your+Image' },
    { id: uuidv4(), type: 'text', content: 'Add new blocks below using the buttons. This demonstrates a simple block-based editor.' },
    { id: uuidv4(), type: 'heading', content: 'Another Section for Testing' },
    { id: uuidv4(), type: 'text', content: 'Feel free to play around!' },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedItemIndex = useRef<number | null>(null);

  const reorder = useCallback((list: Block[], startIndex: number, endIndex: number): Block[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setIsDragging(true);
    draggedItemIndex.current = index;
    sessionStorage.setItem('draggedBlockId', blocks[index].id);
    e.dataTransfer.setData('text/plain', blocks[index].id);
    e.dataTransfer.effectAllowed = 'move';
  }, [blocks]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItemIndex.current !== null && draggedItemIndex.current !== index) {
      setDragOverIndex(index);
    }
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragLeave = useCallback(() => setDragOverIndex(null), []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedItemIndex.current === null) return;
    const startIndex = draggedItemIndex.current;
    if (startIndex === dropIndex) {
      setIsDragging(false);
      draggedItemIndex.current = null;
      sessionStorage.removeItem('draggedBlockId');
      return;
    }
    const reorderedBlocks = reorder(blocks, startIndex, dropIndex);
    setBlocks(reorderedBlocks);
    setIsDragging(false);
    draggedItemIndex.current = null;
    sessionStorage.removeItem('draggedBlockId');
  }, [blocks, reorder]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    draggedItemIndex.current = null;
    sessionStorage.removeItem('draggedBlockId');
  }, []);

  const addBlock = useCallback((type: Block['type']) => {
    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: type === 'image' ? `https://placehold.co/200x150/d3d3d3/555555?text=${type.toUpperCase()}` : `New ${type} block`,
      isEditing: type !== 'image', // Automatically enter edit mode for new text/heading
    };
    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
  }, []);

  // Toggles the editing state for a specific block
  const toggleEditMode = useCallback((id: BlockId) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, isEditing: !block.isEditing } : { ...block, isEditing: false }
      )
    );
  }, []);

  // Updates the content of a specific block
  const updateBlockContent = useCallback((id: BlockId, content: string) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, content } : block
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Interactive Block Document
        </h1>

        <div className="mb-8 pb-6 border-b border-gray-200 flex flex-wrap justify-center gap-4">
          <button onClick={() => addBlock('text')} className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75">
            Add Text Block
          </button>
          <button onClick={() => addBlock('heading')} className="px-6 py-3 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75">
            Add Heading Block
          </button>
          <button onClick={() => addBlock('image')} className="px-6 py-3 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75">
            Add Image Block
          </button>
        </div>

        <div
          className={`p-4 rounded-lg bg-gray-50 transition-colors duration-200 ease-in-out ${isDragging ? 'ring-2 ring-gray-200' : ''}`}
          onDragOver={(e) => { e.preventDefault(); if (blocks.length === 0) setDragOverIndex(0); }}
          onDrop={(e) => { if (blocks.length === 0 && draggedItemIndex.current !== null) { e.preventDefault(); setDragOverIndex(null); const draggedBlock = blocks[draggedItemIndex.current]; setBlocks([draggedBlock]); setIsDragging(false); draggedItemIndex.current = null; sessionStorage.removeItem('draggedBlockId'); } }}
          onDragLeave={() => { if (blocks.length === 0) setDragOverIndex(null); }}
          onDragEnd={handleDragEnd}
          style={{ minHeight: '300px' }}
        >
          {blocks.map((block, index) => (
            <BlockItem
              key={block.id}
              block={block}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              updateBlockContent={updateBlockContent}
              toggleEditMode={toggleEditMode}
              isDragging={isDragging}
              dragOverIndex={dragOverIndex}
            />
          ))}
          {blocks.length === 0 && (
            <div className="text-center text-gray-500 py-10 border border-dashed border-gray-300 rounded-md">
              Drag a block here or add a new one!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <BlockEditor />
    </>
  );
}

export default App;
