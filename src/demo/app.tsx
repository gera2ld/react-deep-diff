import React, { useEffect, useState } from 'react';
import { DeepDiff } from '../index';

interface JSONInputItem {
  value: string;
  changed: boolean;
  obj?: any;
  error?: boolean;
}

const defaultValues: JSONInputItem[] = [
  {
    changed: true,
    value: `\
{
  "a": [1, 2, 3, 5],
  "b": 1,
  "c": null
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

function ExternalLink({ className, href, children }: React.PropsWithChildren<{
  className?: string;
  href: string;
}>) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  );
}

export function App() {
  const [items, setItems] = useState<JSONInputItem[]>(defaultValues);

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
      <h1 className="text-2xl font-bold text-center">React Deep Diff</h1>
      <div className="flex justify-center items-center py-2">
        <ExternalLink className="mr-2" href="https://npm.im/react-deep-diff">
          <img src="https://img.shields.io/npm/v/react-deep-diff.svg" alt="NPM" />
        </ExternalLink>
        <ExternalLink href="https://github.com/gera2ld/react-deep-diff">
          <img src="https://img.shields.io/github/stars/gera2ld/react-deep-diff?style=social" alt="GitHub" />
        </ExternalLink>
      </div>
      <div className="flex">
        {items.map((item, i) => (
          <div className="flex-1" key={i}>
            Object {i + 1}:
            <textarea className={item.error ? 'error' : ''} value={item.value} onChange={getChangeHandler(i)} />
          </div>
        ))}
      </div>
      <DeepDiff className="flex-1" obj1={items[0]?.obj} obj2={items[1]?.obj} />
      <div className="text-center py-2">
        Powered by <ExternalLink href="https://github.com/gera2ld/deepdiff">@gera2ld/deepdiff</ExternalLink> and <ExternalLink href="https://github.com/gera2ld/format-json">@gera2ld/format-json</ExternalLink> - designed by <ExternalLink href="https://github.com/gera2ld">Gerald</ExternalLink>
      </div>
    </div>
  );
}
