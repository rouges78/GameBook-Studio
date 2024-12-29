import React from 'react';

interface EditableTitleProps {
  id: number;
  title: string;
  onSave: (id: number, title: string) => void;
  onCancel: () => void;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({
  id,
  title,
  onSave,
  onCancel
}) => {
  const [value, setValue] = React.useState(title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSave(id, value);
    } else if (event.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(id, value);
  };

  return (
    <foreignObject
      x="-100"
      y="-12"
      width="200"
      height="24"
      style={{ pointerEvents: 'auto' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="w-full px-2 py-1 bg-[#1A2B3B] text-gray-200 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-center"
      />
    </foreignObject>
  );
};
