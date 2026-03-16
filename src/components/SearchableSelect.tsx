import { useState, useRef, useEffect, useMemo } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

export function SearchableSelect({ options, value, onChange, placeholder = '-- Vyberte --', id, required }: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  useEffect(() => {
    if (!value) setSearch('');
    else setSearch(selectedLabel);
  }, [value, selectedLabel]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!value) setSearch('');
        else setSearch(selectedLabel);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, selectedLabel]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const needle = search.trim().toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(needle));
  }, [options, search]);

  const handleInputChange = (val: string) => {
    setSearch(val);
    setOpen(true);
    if (!val.trim()) {
      onChange('');
    }
  };

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        id={id}
        value={search}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        required={required && !value}
        style={{ width: '100%' }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'white',
          border: '1px solid #ccc',
          borderTop: 'none',
          borderRadius: '0 0 5px 5px',
          zIndex: 50,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }}>
          {filtered.map(o => (
            <div
              key={o.value}
              onClick={() => handleSelect(o.value)}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                background: o.value === value ? '#fff4e1' : 'white',
                borderBottom: '1px solid #f0f0f0',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f0e0')}
              onMouseLeave={(e) => (e.currentTarget.style.background = o.value === value ? '#fff4e1' : 'white')}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && search.trim() && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          padding: '0.5rem 0.75rem',
          background: 'white',
          border: '1px solid #ccc',
          borderTop: 'none',
          borderRadius: '0 0 5px 5px',
          zIndex: 50,
          color: '#999',
        }}>
          Žádná shoda
        </div>
      )}
    </div>
  );
}
