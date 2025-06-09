import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import BlockItem from './BlockItem';
import { Block, BlockId } from '../types';

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
      isEditing: type !== 'image',
    };
    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
  }, []);

  const toggleEditMode = useCallback((id: BlockId) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, isEditing: !block.isEditing } : { ...block, isEditing: false }
      )
    );
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {blocks.map((block, index) => (
              <div className={`${index % 4 === 0  || index % 4 === 3 ? 'col-span-1 sm:col-span-2' : 'col-span-1 sm:col-span-1'}`}>
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
              </div>
            ))}
          </div>
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

export default BlockEditor;