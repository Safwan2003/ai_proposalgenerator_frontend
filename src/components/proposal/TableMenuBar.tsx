
import { Editor } from '@tiptap/react';

const TableMenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-300 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Insert Table
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Add Column Before
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Add Column After
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Delete Column
      </button>
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Add Row Before
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Add Row After
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Delete Row
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Delete Table
      </button>
    </div>
  );
};

export default TableMenuBar;
