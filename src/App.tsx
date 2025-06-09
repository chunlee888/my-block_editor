import React from 'react';
import BlockEditor from './components/BlockEditor';

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