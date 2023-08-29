---
title: '博客答案：React 渲染行为（几乎）完整指南'
date: '2023-03-01'
update: '2023-03-19'
author: 'Mark "acemarke" Erikson'
translator: '2nonnon'
tags: 'react context redux'
---

原文链接：[Blogged Answers: A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)

*React 渲染的相关细节，以及 Context 和 React-Redux 的使用如何影响 React 渲染*

我已经看到很多关于 React 何时、为何和如何重新渲染组件的持续困惑，以及 Context 和 React-Redux 的使用将如何影响这些重新渲染的时机和范围。在输入了几十次这个解释的变体之后，似乎值得尝试写一个我可以推荐给人们的综合解释。请注意，所有这些信息都可以在线获得，并且已经在许多其他优秀的博客文章和文章中得到解释，其中一些我在“更多信息”部分的最后链接以供参考。但是，人们似乎正在努力将这些碎片放在一起以充分理解，因此希望这篇文章将有助于为大家理清思路。

> **注意**：2022 年 10 月更新，涵盖 React 18 和未来的 React 更新

我还根据这篇文章为 React Advanced 2022 做了一个演讲：

[**React Advanced 2022 - React 渲染行为的（简要）指南**](https://blog.isquaredsoftware.com/2022/10/presentations-react-rendering-behavior/)

- [什么是“渲染”？](#what-is-rendering)
  - [渲染过程概述](#rendering-process-overview)
  - [渲染和提交阶段](#render-and-commit-phases)
- [React 如何处理渲染？](#how-does-react-handle-renders)
  - [排队渲染](#queuing-renders)
  - [标准渲染行为](#standard-render-behavior)
  - [React 渲染规则](#rules-of-react-rendering)
  - [组件元数据和 fiber](#component-metadata-and-fibers)
  - [组件类型和调和](#component-types-and-reconciliation)
  - [Keys 和 调和](#keys-and-reconciliation)
  - [渲染批处理和渲染时机](#render-batching-and-timing)
  - [异步渲染、闭包和状态快照](#async-rendering-closures-and-state-snapshots)
  - [渲染行为边缘情况](#render-behavior-edge-cases)
- [提高渲染性能](#improving-rendering-performance)
  - [组件渲染优化技巧](#component-render-optimization-techniques)
  - [新属性引用如何影响渲染优化](#how-new-props-references-affect-render-optimizations)
  - [优化属性引用](#optimizing-props-references)
  - [记忆一切？](#memoize-everything)
  - [不变性和重新渲染](#immutability-and-rerendering)
  - [测量 React 组件渲染性能](#measuring-react-component-rendering-performance)
- [Context 和渲染行为](#context-and-rendering-behavior)
  - [Context 基础知识](#context-basics)
  - [更新 Context 值](#updating-context-values)
  - [state 更新、Context和重新渲染](#state-updates-context-and-re-renders)
  - [Context 更新和渲染优化](#context-updates-and-render-optimizations)
- [React-Redux 和渲染行为](#react-redux-and-rendering-behavior)
  - [React-Redux Subscriptions](#react-redux-subscriptions)
  - [`connect` 和 `useSelector` 之间的差异](#differences-between-connect-and-useselector)
- [未来的 React 改进](#future-react-improvements)
  - [“React Forget”记忆编译器](#react-forget-memoizing-compiler)
  - [上下文选择器](#context-selectors)
- [总结](#summary)
- [结语](#final-thoughts)
- [更多信息](#further-information)

## 什么是“渲染”？ {#what-is-rendering}

**渲染**是 React 要求你的组件根据当前 props 和 state 的组合来描述他们希望他们的 UI 部分是什么样子的过程。

### 渲染过程概述 {#rendering-process-overview}

在渲染过程中，React 将从组件树的根组件开始，向下循环以查找所有被标记为需要更新的组件。对于每个被标记的组件，React 将调用 `FunctionComponent(props)`（对于函数组件）或 `classComponentInstance.render()`（对于类组件），并保存渲染输出以供本次渲染阶段（render pass）的后续步骤使用。

组件的渲染输出通常以 JSX 语法编写，然后在编译和准备部署 JS 时将其转换为 `React.createElement()` 调用。`createElement` 返回 React *元素*，这些 *元素* 是描述 UI 预期结构的普通 JS 对象。例：

```jsx
// 这是 JSX 语法:
return <MyComponent a={42} b="testing">Text here</MyComponent>

// 被转换为如下调用:
return React.createElement(MyComponent, {a: 42, b: "testing"}, "Text Here")

// 并返回如下 React 元素对象:
{type: MyComponent, props: {a: 42, b: "testing"}, children: ["Text Here"]}

// 并且在内部, React 调用真实的函数来渲染它:
let elements = MyComponent({...props, children})

// 对于 "宿主组件（host components）" 比如 HTML:
return <button onClick={() => {}}>Click Me</button>
// 变成
React.createElement("button", {onClick}, "Click Me")
// 最终:
{type: "button", props: {onClick}, children: ["Click me"]}
```

从整个组件树中收集渲染输出后，React 将比较新旧对象树（通常被称为“虚拟 DOM”），并收集需要应用以使真正的 DOM 看起来像当前所需输出的更改。比较和计算的过程称为[“调和“ (reconciliation)](https://reactjs.org/docs/reconciliation.html)”。

然后 React 将所有计算出的更改在一个同步序列中应用于 DOM。

>**注意：** 近年来，React 团队淡化了“虚拟 DOM”一词。[丹·阿布拉莫夫（Dan Abramov）说](https://twitter.com/dan_abramov/status/1066328666341294080?lang=en)：
>
>我希望我们可以停用“虚拟DOM”一词。在 2013 年使用这个词是有道理的，因为否则人们会认为 React 会在每次渲染时创建 DOM 节点。但如今人们很少会这样认为。“虚拟DOM”听起来像是某些DOM问题的解决方法。但这不是 React 的本质。
>React 是“value UI”。它的核心原则是 UI 是一个值，就像字符串或数组一样。你可以把它保存在一个变量中，传递它，用JavaScript控制流操作它，等等。这种表达是重点 —— 而不是为了避免某些对 DOM 的更改而做对比。
>它甚至并不总是代表 DOM，例如 `<Message recipientId={10} />` 不是 DOM。 从概念上讲，它代表函数懒调用（lazy function calls）：`Message.bind(null, { recipientId: 10 })`。

### 渲染和提交阶段 {#render-and-commit-phases}

React 团队从概念上将这项工作分为两个阶段：

- “渲染阶段”包含渲染组件和计算更改的所有工作
- “提交阶段”是将这些更改应用于 DOM 的过程

在 React 在提交阶段更新 DOM 后，它会相应地更新所有 ref 以指向它们所引用的 DOM 节点和组件实例。然后，它同步执行 `componentDidMount` 和 `componentDidUpdate` 这两种类生命周期方法和 `useLayoutEffect` 钩子。

然后 React 会设置一个短暂的定时器，当它到期时执行所有的 `useEffect` 钩子。这步骤也称为“副作用（Passive Effects）”阶段。

React 18 添加了“并发渲染”功能，如 [`useTransition`](https://github.com/reactwg/react-18/discussions/64)。这使 React 能够在渲染阶段暂停工作，以允许浏览器处理事件。之后 React 会根据情况恢复、丢弃或重新计算该工作。本次渲染阶段完成后，React 仍将一次性同步执行提交阶段。

要理解的一个关键部分是 **“渲染”与“更新 DOM”不是一回事，并且组件可以在不发生任何可见更改的情况下进行渲染**。当 React 渲染一个组件时：

- 组件可能会返回与上次相同的渲染输出，因此无需更改
- 在并发渲染中，React 最终可能会多次渲染一个组件，但如果其他更新使当前完成的工作无效，则每次都会丢弃渲染输出。

这个[优秀的交互式 React 钩子时间线图](https://julesblom.com/writing/react-hook-component-timeline)有助于说明渲染、提交和执行钩子的顺序：

![React hooks timeline diagram](https://blog.isquaredsoftware.com/images/2020-05-react-rendering-behavior/react-hook-timeline-diagram.png "React hooks timeline diagram")

有关其他可视化效果，请参阅：

- [Reack 钩子流程图](https://github.com/donavon/hook-flow)
- [React 钩子渲染/提交阶段图](https://wavez.github.io/react-hooks-lifecycle/)
- [React 类生命周期方法图](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)

## React 如何处理渲染？{#how-does-react-handle-renders}

### 排队渲染 {#queuing-renders}

初始渲染完成后，有几种不同的方法可以告诉 React 入队一个重新渲染：

- 函数组件：
  - `useState` setters
  - `useReducer` dispatches
- 类组件：
  - `this.setState()`
  - `this.forceUpdate()`
- 其他：
  - 再次调用 ReactDOM 顶层 `render(<App>)` 方法（相当于在根组件调用 `forceUpdate()`）
  - 从新的 `useSyncExternalStore` 钩子触发的更新

请注意，函数组件没有 `forceUpdate` 方法，但您可以使用一个始终递增的 `useReducer` 钩子来实现同样的功能：

```ts
const [, forceRender] = useReducer((c) => c + 1, 0);
```

### 标准渲染行为 {#standard-render-behavior}

记住这一点非常重要：

**React 的默认行为是，当父组件渲染时，React 将递归渲染其 *所有* 子组件！**

例如，假设我们有一个 `A > B > C > D` 的组件树，并且我们已经在页面上显示了它们。用户单击 `B` 组件中递增计数器的按钮：

- 我们会在 `B` 组件中调用 `setState()` ，这将入队一次 B 组件的重新渲染
- React 从树的顶部开始本次渲染阶段
- React 看到 `A` 组件没有被标记为需要更新，于是跳过它
- React 看到 `B` 组件被标记为需要更新，因此渲染它。`B` 组件像上次渲染时一样返回 `<C />`。
- `C` 组件原本 *没有* 被标记为需要更新。但是，由于它的父组件 `B` 被渲染，React 现在向下移动并渲染 `C` 组件。C 再次返回 `<D />`。
- `D` 组件也没有标记为需要渲染，但由于它的父组件 `C` 被渲染，React 同样向下移动并渲染 `D`。

换一种说法：

**默认情况下，渲染一个组件将同时导致其内部的 *所有* 组件被渲染！**

此外，另一个关键点：

**在正常渲染中，React 并 *不关心* 是否有“属性更改”——它会因为父组件渲染而无条件渲染子组件！**

这意味着在根组件 `<App>` 中调用 `setState()`，在不改变 React 默认行为的情况下，*将导致* React 重新渲染组件树中的每个组件。毕竟，React 最初的推销宣传之一是[“表现得像我们在每次更新时重绘整个应用程序”](https://www.slideshare.net/floydophone/react-preso-v2)。

此时，树中的大多数组件很可能会返回与上次完全相同的渲染输出，因此 React 不需要对 DOM 进行任何更改。*但是*，React 仍然需要做渲染组件和比较渲染输出的工作。这两者都需要时间和精力。

请记住，**渲染并不是一件 *坏事* —— 这是 React 知道它是否需要实际对 DOM 进行更改的方式！**

### React 渲染规则 {#rules-of-react-rendering}

React 渲染的主要规则之一是**渲染必须是“纯的 (pure)”，没有任何副作用！**

这可能是棘手和令人困惑的，因为许多副作用并不明显，并且不会导致任何破坏。例如，严格来说，一个 `console.log()` 是一种副作用，但它实际上不会破坏任何东西。改变属性（prop）绝对是一种副作用，它也 *可能不会* 破坏任何东西。在渲染过程中进行 AJAX 调用也绝对是一种副作用，并且肯定会导致意外的应用行为，具体取决于请求的类型。

塞巴斯蒂安·马克贝奇（Sebastian Markbage）写了一篇题为[**《React 规则》（The Rules of React）**](https://gist.github.com/sebmarkbage/75f0838967cd003cd7f9ab938eb1958f)的优秀文章。在其中，他定义了不同 React 生命周期方法的预期行为，包括 `render` ，以及哪些操作被认为是安全的、“纯的”操作，哪些操作是不安全的。值得完整阅读，但我会总结关键点：

- 渲染逻辑不能做的：
  - 不能更改现有变量和对象
  - 不能创建随机值，例如 `Math.random()` 或 `Date.now()`
  - 不能发送网络请求
  - 不能入队 state 更新
- 渲染逻辑可以做的：
  - 更改渲染时新创建的对象
  - 抛出错误
  - “延迟初始化（Lazy initialize）”尚未创建的数据，例如缓存的值

### 组件元数据和 fiber {#component-metadata-and-fibers}

React 存储一个内部数据结构，用于跟踪应用程序中存在的当前所有组件实例。此数据结构的核心部分是被称为“fiber”的对象，其中包含描述以下内容的元数据字段：

- 此时应该在组件树中渲染什么组件类型
- 与此组件关联的当前 props 和 state
- 指向父组件、兄弟组件和子组件的指针
- React 用来跟踪渲染过程的其他内部元数据

如果你曾经听说过用[“React Fiber”这个短语](https://www.youtube.com/watch?v=ZCuYPiUIONs)来描述 React 版本或功能，那实际上指的是 React 内部的重写，它更改了渲染逻辑以依赖这些“Fiber”对象作为关键数据结构。它是作为 React 16.0 发布的，因此从那时起的每个 React 版本都使用了这种实现。

该 `Fiber` 类型的缩略版本如下所示：

```ts
export type Fiber = {
  // 识别 fiber 类型的标签
  tag: WorkTag;

  // 此子项的唯一标识
  key: null | string;

  // 与此 fiber 相关联的解析函数或类
  type: any;

  // 单向链表树结构
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  // 输入是流入这个 fiber 的数据，来自 (arguments/props)
  pendingProps: any;
  memoizedProps: any; // 用于生成输出的 props

  // state 更新和回调的队列
  updateQueue: Array<State | StateUpdaters>;

  // 用于生成输出的 state
  memoizedState: any;

  // 此 fiber 的依赖 (contexts, events) , 如果有的话
  dependencies: Dependencies | null;
};
```

（您可以在此处查看 [React 18 中 `Fiber` 类型的完整定义](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactInternalTypes.js#L64-L193)。）

在渲染过程中，React 将迭代这个 fiber 对象树，并在计算新的渲染结果时构造一个更新树。

请注意，**这些“fiber”对象存储了 *真正* 的组件属性和状态值**。当你在你的组件中使用 `props` 和 `state` 时，React 实际上给你存储在 fiber 对象上的值。事实上，特别是对于类组件，[React 会在渲染组件之前显式地使用 `componentInstance.props = newProps` 将 `props` 复制到组件上](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberClassComponent.new.js#L1083-L1087)。因此，`this.props` 确实存在，但它的存在只是因为 React 从其内部数据结构中复制了引用。从这个意义上说，组件在某种程度上是 React fiber 对象上的一种表相。

类似地，React 钩子之所以有效，是因为 [React 将组件的所有钩子存储为附加到该组件的 fiber 对象的链表](https://www.swyx.io/getting-closure-on-hooks/)。当 React 渲染函数组件时，它会从 fiber 获取钩子描述项的链表，每次调用另一个钩子时，[它都会返回存储在钩子描述对象中的相应值（例如 `useReReduce` 的 `state`和 `useReducer` 值)](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L908)。

当父组件首次渲染给定的子组件时，React 会创建一个 fiber 对象来跟踪组件的“实例”。对于类组件，[它真正调用 `const instance = new YourComponentType（props）`](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberClassComponent.new.js#L656)，并将实际的组件实例保存到 fiber 对象上。对于函数组件，[React 只是将 `YourComponentType（props）` 作为函数调用。](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L428)

### 组件类型和调和 {#component-types-and-reconciliation}

如[“调和”文档页面](https://reactjs.org/docs/reconciliation.html#elements-of-different-types)中所述，React 试图通过在重新渲染期间尽可能多地重用现有的组件树和 DOM 结构来提高效率。如果你要求 React 在树中的同一位置渲染相同类型的组件或 HTML 节点，React 将重用它，并在适当的情况下应用更新，而不是从头开始重新创建它。这意味着只要你持续要求 React 在同一个地方重复渲染相同类型的组件，React 就会保持该组件实例处于活跃状态。对于类组件，它实际上确实使用组件的相同实例。函数组件没有像类那样真正的“实例”，但从某种意义上我们可以认为 `<MyFunctionComponent />` 就代表了“实例”，即“某种类型的组件在这里显示并保持活跃状态”。

那么，React 如何知道输出何时又如何发生了更改呢？

React 的渲染逻辑首先对元素的 `type` 字段使用 `===` 比较引用。如果给定位置中的元素已更改为不同的类型，例如从 `<div>` 变为 `<span>` 或 `<ComponentA>` 变为 `<ComponentB>` ，React 将通过假设整个树都已更改来加快比较过程。因此，**React 将销毁该部分整个现有的组件树，包括所有 DOM 节点**，并使用新的组件实例从头开始重新创建它。

这意味着**在渲染时绝不能创建新的组件类型！** 每当你创建一个新的组件类型时，它都是一个不同的引用，这将导致 React 反复销毁并重新创建子组件树。

换句话说，***不要*** 这样做：

```jsx
// ❌ 不好!
// 这将每次都创建一个新的 `ChildComponent` 引用!
function ParentComponent() {
  function ChildComponent() {
    return <div>Hi</div>;
  }

  return <ChildComponent />;
}
```

相反，请始终单独定义组件：

```jsx
// ✅ 好
// 这只会创建一个组件类型引用
function ChildComponent() {
  return <div>Hi</div>;
}

function ParentComponent() {
  return <ChildComponent />;
}
```

Keys 和 调和 {#keys-and-reconciliation}

React 识别组件“实例”的另一种方式是通过伪属性 `key`。React 用 `key` 作为唯一标识符来区分相同组件类型的不同实例。

请注意，实际上 `key` 不是一个 *真正的* 属性 —— 它是对 React 的指令。React 将始终将其剥离，并且永远不会传递到实际组件，因此您永远不会拥有 `props.key` —— 它将永远是 `undefined`。

我们使用 `key` 的主要地方是渲染列表。如果要渲染可能以某种方式更改的数据（例如重新排序、添加或删除列表项），则 `key` 在这里尤其重要。这里特别重要的是，**如果可能的话，`key` *应该是* 数据中的某种唯一 ID —— 仅使用数组索引作 `key` 只能作为最后的兜底方案！**

```jsx
// ✅ 使用数据对象 ID 作为列表项的 key
todos.map((todo) => <TodoListItem key={todo.id} todo={todo} />);
```

下面是一个为什么这很重要的示例。假设我使用数组索引作为键来渲染包含 10 个 `<TodoListItem>` 组件的列表。React 会看到 10 个项目，键为 `0..9`。现在，如果我们删除项目 6 和 7，并在末尾添加三个新条目，我们最终会渲染键为 `0..10` 的项目。所以，在 React 看来，我真的只是在最后添加了一个新条目，因为我们从 10 个列表项增加到了 11 个。React 会很乐意重用现有的 DOM 节点和组件实例。但是，这意味着我们现在可能使用原本传递给列表项 #8 的 `todo` 渲染 `<TodoListItem key={6}>`。因此，组件实例仍然处于活动状态，不过现在它获得了与以前不同的数据对象作为属性。这可能有效，但也可能会产生意外行为。此外，React 现在必须对几个列表项应用更新以更改文本和其他 DOM 内容，因为现有的列表项现在必须显示与以前不同的数据。这些更新在这里真的没有必要，因为这些列表项都没有改变。

如果我们对每个列表项使用 `key={todo.id}`，React 将正确看到我们删除了两个项目并添加了三个新项目。它将销毁两个已删除的组件实例及其关联的 DOM，并创建三个新的组件实例及其 DOM。这比不必要地更新实际上没有更改的组件要好。

`key` 对于标识列表之外的组件实例也很有用。**您可以随时向任何 React 组件添加 `key` 以指示其身份，更改该 `key` 将导致 React 销毁旧的组件实例和 DOM 并创建新的组件实例和 DOM**。一个常见的用例是列表 + 详细表单组合，其中表单显示当前所选列表项的数据。渲染 `<DetailForm key={selectedItem.id}>` 将导致 React 在所选项目更改时销毁并重新创建表单，从而避免表单内部过期状态导致的问题。

### 渲染批处理和渲染时机 {#render-batching-and-timing}

默认情况下，每次调用 `setState()` 都会让 React 开启一次新的渲染，同步执行它然后返回结果。但是，React 也会自动应用一种优化，即 *渲染批处理*。**渲染批处理是指对 `setState（）` 的多次调用只会入队一次渲染和执行，通常略有延迟**。

React 社区经常将其描述为“状态更新可能是异步的”。新的 React 文档还将其描述为[“状态是快照”](https://beta.reactjs.org/learn/state-as-a-snapshot)。这都是指这种渲染批处理行为。

在 React 17 及更早版本中，React 只在 React 事件处理程序（如 `onClick` 回调）中进行批处理。在事件处理程序之外排队的更新（例如在 `setTimeout` 、`await` 之后或普通 JS 事件处理程序中）*不会* 批处理，并且每个更新都会导致一次的重新渲染。

但是，**[React 18 现在对在任何单个事件循环中排队的 *所有* 更新进行“自动批处理”。](https://github.com/reactwg/react-18/discussions/21)** 这有助于减少所需的渲染总数。

让我们看一个具体的例子。

```js
const [counter, setCounter] = useState(0);

const onClick = async () => {
  setCounter(0);
  setCounter(1);

  const data = await fetchSomeData();

  setCounter(2);
  setCounter(3);
};
```

在 React 17 中，这执行了**三次**渲染。第一次渲染将批处理`setCounter(0)` 和 `setCounter(1)` ，因为它们都是在原事件处理调用栈期间发生的，所以它们都发生在 `unstable_batchedUpdates()` 调用中。

然而，`setCounter(2)`的调用在 `await` 之后。这意味着原本的同步调用栈已完成，函数的后半部分会稍后在完全独立的事件循环调用栈中运行。因此，React 将同步执行一次完整的渲染作为 `setCounter(2)` 调用内的最后一步，渲染完成后从 `setCounter(2)` 返回。

同样的事情也会发生 `setCounter(3)`，因为它也在原事件处理程序之外运行，所以不会被批处理。

但是，**在 React 18 中，这会执行 *两次* 渲染**。`setCounter(0)` 和 `setCounter(1)` 会被一起处理，因为它们位于同一个事件循环时钟周期中。稍后，在 `await` 之后，`setCounter(2)` 和 `setCounter(3)` 两者会被一起处理 —— 即使它们要晚得多，但它们 *也是* 在同一事件循环中排队的两个状态更新，因此它们被批处理到第二次渲染中。

### 异步渲染、闭包和状态快照 {#async-rendering-closures-and-state-snapshots}

我们经常看到的一个非常常见的错误是用户设置新值后尝试打印现有变量名称。然而打印结果是原来的值，而不是更新的值。

```ts
function MyComponent() {
  const [counter, setCounter] = useState(0);

  const handleClick = () => {
    setCounter(counter + 1);
    // ❌ 这不会生效!
    console.log(counter);
    // 打印结果是原来的值 - 为什么值没有被更新??????
  };
}
```

那么，为什么这不起作用呢？

正如上面提到的，有经验的用户通常会说“React 状态更新是异步的”。这有一定的道理，但这里还有更多的细节，实际上还有几个不同的问题。

严格来说，React 渲染实际上是同步的 —— 它将在本轮事件循环的最后一个“微任务”中执行。（虽然这有些啰嗦，但这篇文章旨在确保准确明了。）但是，从 `handleClick` 函数的角度来看，它的确是“异步”的，因此您无法立即看到结果，实际的更新比 `setCounter()` 调用晚得多。

但是，这不起作用还有一个更大的原因。**`handleClick` 函数是一个 *“闭包”*  —— 它 *只能* 看到 *定义函数时* 存在的变量的值**。换句话说，**这些状态变量是时间的一个快照**。

由于 `handleClick` 是在此函数组件的最近一次渲染期间定义的，**因此它 *只能* 看到其被定义的那次渲染期间存在的 `counter` 值。** 当我们调用 `setCounter()` 时，它会入队一次 *未来的* 渲染，并且 *该未来的* 渲染将有一个具有新值的 `counter` 变量 和新的 `handleClick` 函数......**但是 *现在这个* `handleClick` 副本永远无法看到那个新值。**

新的 React 文档在 [**状态是快照**](https://beta.reactjs.org/learn/state-as-a-snapshot) 一节中更详细地介绍了这一点，强烈建议您阅读。

回到最初的例子：试图在设置更新值后立即使用变量几乎总是错误的方法，建议您需要重新考虑如何使用该值。

### 渲染行为边缘情况 {#render-behavior-edge-cases}

#### 提交阶段生命周期 {#commit-phase-lifecycles}

提交阶段生命周期方法中还有一些额外的边缘情况：`componentDidMount`、`componentDidUpdate` 和 `useLayoutEffect`。这些主要是为了允许您在渲染之后且浏览器绘制之前执行其他逻辑。一个特别常见的用例是：

- 首先使用一些部分数据渲染组件
- 在提交阶段生命周期中，使用 refs 测量页面中 DOM 节点的实际大小
- 根据这些测量值在组件中设置一些状态
- 立即使用更新的数据重新渲染

在此用例中，我们不希望初始“部分”渲染的 UI 对用户可见 - 我们只希望显示“最终” UI。在 DOM 结构修改的同时，浏览器会重新计算该它，但是只要 JS 脚本仍然在执行并阻塞事件循环，浏览器就不会将任何内容实际绘制到屏幕上。因此，您可以执行多个 DOM 修改，例如 `div.innerHTML = "a"; div.innerHTML = b";`，并且 `"a"` 永远不会出现。

因此，**React 将始终在提交阶段生命周期中同步执行渲染**。这样，如果您尝试执行类似“部分>最终”切换的更新，则屏幕上将仅显示“最终”内容。

据我所知，`useEffect` 回调中的状态更新会排队，并在所有`useEffect` 回调完成后在“副作用”阶段结束时刷新。

#### 协调器批处理方法 {#reconciler-batching-methods}

React 协调器（ReactDOM，React Native）具有更改渲染批处理的方法。

对于 React 17 及更早版本，您可以使用`unstable_batchedUpdates()`将事件处理程序之外的多个更新包装在一起，以将它们批处理在一起。（请注意，尽管有 `unstable_` 前缀，但它在Facebook和公开库的代码中被大量使用和依赖 - [React-Redux v7 `unstable_batchedUpdates`内部使用](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/#use-of-react-s-batched-updates-api)。)

由于 React 18 默认自动批处理，因此 [React 18 有一个 `flushSync（）` API](https://beta.reactjs.org/apis/react-dom/flushSync)，您可以使用它强制立即渲染并选择退出自动批处理。

请注意，由于这些是特定于协调器的 API，因此替换协调器如`react-three-fiber` 和 `ink`可能不会公开它们。检查 API 声明或实现详细信息以查看可用的内容。

#### `<StrictMode>` {#strictmode}

React 在**开发模式中会渲染两次 `<StrictMode>` 标签内的组件**。这意味着渲染逻辑运行的次数与提交的渲染数不同，并且 *您不能* 在渲染时依赖`console.log()`语句来计算已发生的渲染次数。相反，可以使用 React DevTools 探查器捕获跟踪并计算提交渲染的总体数量，或者在 `useEffect` 钩子或 `componentDidMount/Update` 生命周期中添加日志记录。这样，日志只会在 React 实际完成渲染并提交时打印出来。

#### 渲染时设置状态 ︎{#setting-state-while-rendering}

在正常情况下，*切勿* 在实际渲染逻辑中入队状态更新。换句话说，可以创建一个在发生点击时调用 `setSomeState()` 的点击回调，但 *不应* 作为实际渲染行为的一部分调用 `setSomeState()`。

但是，有一个例外。**函数组件 *可以在* 渲染时直接调用 `setSomeState（）`，只要它是有终止条件，** 不会在每次渲染时都执行。这充当[类组件中 `getDerivedStateFromProps` 的函数组件等效项](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops)。如果函数组件在渲染时将状态更新入队，[React 将立即应用状态更新并在继续之前同步重新渲染该组件](https://github.com/facebook/react/blob/v18.0.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L430-L469)。如果组件无限地保持入队状态更新并强制 React 重新渲染它，React 将在设定的重试次数后中断循环并抛出错误（目前为 50 次尝试）。此技术可用于根据 prop 更改立即强制更新状态值，而无需通过在 `useEffect` 中调用 `setSomeState()` 来请求重新渲染。
