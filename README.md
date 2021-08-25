# react-deep-diff

React component to show diff between two objects.

👉🏻 [Demo](https://gera2ld.github.io/react-deep-diff/).

![demo](https://user-images.githubusercontent.com/3139113/131153042-b9348dae-e18d-416e-bf9b-ecf0ccdfc57a.png)

## Installation

```bash
$ yarn add react-deep-diff
```

## Usage

```js
import { DeepDiff } from 'react-deep-diff';

function App() {
  return (
    <DeepDiff
      className="my-diff"
      obj1={obj1}
      obj2={obj2}
    />
  );
}
```
