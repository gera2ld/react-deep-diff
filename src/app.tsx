import { deepdiff, DiffItem } from '@gera2ld/deepdiff';
import { render, FormatJSONOptions, ItemTypes } from '@gera2ld/format-json';
import React, { useEffect, useState } from 'react';

interface JSONInputItem {
  value: string;
  changed: boolean;
  obj?: any;
  error?: boolean;
}

const jsonFormatOptions: FormatJSONOptions = {
  indent: 2,
  quoteAsNeeded: false,
  quote: '"',
  trailing: false,
  template: false,
  onData(item) {
    item.data = [
      { type: 'pathStart', value: '', path: item.path },
      ...item.data,
      { type: 'pathEnd', value: '', path: item.path },
    ];
  },
};

const defaultValues: JSONInputItem[] = [
  {
    changed: true,
    value: `\
{
  "a": [1, 2, 3, 5],
  "b": 1
}`,
  },
  {
    changed: true,
    value: `\
{
  "a": [2, 3, 4, 5],
  "b": 2
}`,
  },
];

function JsonDiff({ obj1, obj2 }: {
  obj1: any;
  obj2: any;
}) {
  if (!obj1 || !obj2) return null;
  const diff = deepdiff(obj1, obj2);
  const root1 = render(obj1, jsonFormatOptions);
  const root2 = render(obj2, jsonFormatOptions);
  console.log(root1, root2);
  const blocks = [];
  {
    let line = [];
    for (const item of root1.data) {
      if (item.type === ItemTypes.BR) {
        lines.push(line.join(''));
        line = [];
      } else {
        line.push(item.value);
      }
    }
    if (line.length) lines.push(line.join(''));
  }
  return (
    <>
      {lines.map((line, i) => <div key={i}>{line}</div>)}
    </>
  );
}

export function App() {
  const [items, setItems] = useState(defaultValues);

  useEffect(() => {
    const timer = setTimeout(() => {
      let hasChange = false;
      const newItems = items.map(item => {
        if (!item.changed) return item;
        hasChange = true;
        let obj: any;
        let error = false;
        try {
          obj = item.value ? JSON.parse(item.value) : null;
        } catch {
          error = true;
        }
        return {
          ...item,
          changed: false,
          obj,
          error,
        };
      });
      if (hasChange) {
        setItems(newItems);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [items]);

  const getChangeHandler = (i: number): React.ChangeEventHandler<HTMLTextAreaElement> => (e) => {
    const newItems = [...items];
    newItems[i] = {
      ...items[i],
      value: e.target.value,
      changed: true,
    };
    setItems(newItems);
  };

  return (
    <div className="flex flex-col h-screen mx-auto max-w-screen-lg">
      <div className="flex">
        {items.map((item, i) => (
          <div className="flex-1" key={i}>
            Object {i + 1}:
            <textarea className={item.error ? 'error' : ''} value={item.value} onChange={getChangeHandler(i)} />
          </div>
        ))}
      </div>
      <div className="flex-1 whitespace-pre">
        <JsonDiff obj1={items[0].obj} obj2={items[1].obj} />
      </div>
    </div>
  );
}