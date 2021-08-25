import React from 'react';
import { deepdiff, DiffOperation } from '@gera2ld/deepdiff';
import {
  render, FormatJSONOptions, FormatJSONRenderItem, ItemTypes, FormatJSONEntry,
} from '@gera2ld/format-json';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import styles from './style.module.css';

interface DiffBlockItem {
  type: number;
  left: string[];
  right: string[];
}

const REPLACE_SUFFIX = '::replace';
const PATH_START = 'pathStart';
const PATH_END = 'pathEnd';

function compare(a: any, b: any) {
  if (a[2] < b[2]) return -1;
  if (a[2] > b[2]) return 1;
  return 0;
}

const jsonFormatOptions: FormatJSONOptions = {
  indent: 2,
  quoteAsNeeded: false,
  quote: '"',
  trailing: false,
  template: false,
  entries(data: any) {
    return Object.entries(data).map(([key, value]) => [
      key,
      value,
      key.endsWith(REPLACE_SUFFIX) ? key.slice(0, -REPLACE_SUFFIX.length) : key,
    ] as FormatJSONEntry).sort((a, b) => {
      return compare(a[2], b[2]) || compare(a[0], b[0]);
    });
  },
  onData(item) {
    item.data = [
      { type: PATH_START, value: '', path: item.path },
      ...item.data,
      { type: PATH_END, value: '', path: item.path },
    ];
  },
};

function getLineInfo(root: FormatJSONRenderItem) {
  const lines = [];
  let line = [];
  const pathMap = {};
  root.data.forEach(item => {
    if (item.type === PATH_START) {
      pathMap[item.path.join('/')] = [lines.length];
    } else if (item.type === PATH_END) {
      pathMap[item.path.join('/')].push(lines.length);
    } else if (item.type === ItemTypes.BR) {
      lines.push(line.join(''));
      line = [];
    } else {
      line.push(item.value);
    }
  });
  lines.push(line.join(''));
  return { lines, pathMap };
}

export function DeepDiff({ obj1, obj2, className }: {
  obj1: any;
  obj2: any;
  className?: string;
}) {
  if (!obj1 || !obj2) return null;
  const diff = deepdiff(obj1, obj2);
  const mergedObj = JSON.parse(JSON.stringify(obj1));
  const insertPaths = [];
  const removePaths = [];
  const replacePaths = [];
  diff.forEach(item => {
    const keys = item.path.slice(1).split('/');
    const parentPath = keys.slice(0, -1);
    const parent = parentPath.reduce((a, b) => a[b], mergedObj);
    if (item.op === DiffOperation.INSERT || item.op === DiffOperation.REPLACE) {
      const insertKeys = [...keys];
      let last = keys[keys.length - 1];
      if (Array.isArray(parent)) {
        const offset = (parent as any).offset || 0;
        parent.splice(offset + +last, 0, item.newVal);
        insertKeys[insertKeys.length - 1] = +last + offset;
        (parent as any).offset = offset + 1;
      } else {
        if (item.op === DiffOperation.REPLACE) {
          last += REPLACE_SUFFIX;
          insertKeys[insertKeys.length - 1] = last;
        }
        parent[last] = item.newVal;
      }
      if (item.op === DiffOperation.INSERT) insertPaths.push(insertKeys);
    }
    if (item.op === DiffOperation.DELETE || item.op === DiffOperation.REPLACE) {
      const removeKeys = [...keys];
      if (Array.isArray(parent)) {
        removeKeys.push(+removeKeys.pop() + ((parent as any).offset || 0));
      }
      if (item.op === DiffOperation.DELETE) removePaths.push(removeKeys);
    }
    if (item.op === DiffOperation.REPLACE) replacePaths.push(keys);
  });
  const root = render(mergedObj, jsonFormatOptions);
  const lineInfo = getLineInfo(root);
  const types = lineInfo.lines.map(() => 0);
  const updateTypes = (paths: string[][], v: number) => {
    for (const keys of paths) {
      const path = keys.join('/');
      const pos = lineInfo.pathMap[path];
      if (pos) {
        const [start, end] = pos;
        for (let i = start; i <= end; i += 1) {
          types[i] = v;
        }
      }
    }
  };
  updateTypes(insertPaths, 1);
  updateTypes(removePaths, 2);
  updateTypes(replacePaths, 3);
  updateTypes(replacePaths.map(keys => [
    ...keys.slice(0, -1),
    keys[keys.length - 1] + REPLACE_SUFFIX,
  ]), 4);
  const blocks: DiffBlockItem[] = [];
  let cur: DiffBlockItem;
  for (let i = 0; i < lineInfo.lines.length; i += 1) {
    const line = Prism.highlight(lineInfo.lines[i], Prism.languages.json, 'json5');
    let type = types[i];
    // merge type 3 and 4 as REPLACE
    if (type === 4) type = 3;
    if (cur?.type !== type) {
      cur = {
        type,
        left: [],
        right: [],
      };
      blocks.push(cur);
    }
    // switch by original type
    switch (types[i]) {
    case 1:
      // insert
      cur.right.push(line);
      break;
    case 2:
      // delete
      cur.left.push(line);
      break;
    case 3:
      // replace from
      cur.left.push(line);
      break;
    case 4:
      // replace to
      cur.right.push(line);
      break;
    default:
      cur.left.push(line);
      cur.right.push(line);
    }
  }
  return (
    <div className={`${styles.diff} ${className || ''}`}>
      {blocks.map((item, i) => Array.from({
        length: Math.max(item.left.length, item.right.length),
      }, (_, j) => {
        const classLeft = [
          item.type > 1 && item.left[j] && styles.removed,
          item.type === 1 && styles.empty,
        ].filter(Boolean).join(' ');
        const classRight = [
          item.type % 2 > 0 && item.right[j] && styles.added,
          item.type === 2 && styles.empty,
        ].filter(Boolean).join(' ');
        return (
          <div key={`${i}-${j}`} className={styles.line}>
            <div className={`${styles.marker} ${classLeft}`} />
            <div className={`${styles.content} ${classLeft}`} dangerouslySetInnerHTML={{ __html: item.left[j] }} />
            <div className={`${styles.marker} ${classRight}`} />
            <div className={`${styles.content} ${classRight}`} dangerouslySetInnerHTML={{ __html: item.right[j] }} />
          </div>
        );
      }))}
    </div>
  );
}

DeepDiff.defaultProps = {
  className: '',
};
