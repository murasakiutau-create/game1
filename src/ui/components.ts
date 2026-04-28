// 軽量DOMヘルパ
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: {
    className?: string;
    text?: string;
    html?: string;
    onClick?: (e: MouseEvent) => void;
    attrs?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
  } = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  if (options.onClick) {
    const handler = options.onClick;
    node.addEventListener('click', (e) => handler(e as MouseEvent));
  }
  if (options.attrs) {
    for (const [k, v] of Object.entries(options.attrs)) node.setAttribute(k, v);
  }
  if (options.style) Object.assign(node.style, options.style);
  for (const c of children) {
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function button(label: string, onClick: () => void, opts: { disabled?: boolean; className?: string } = {}): HTMLButtonElement {
  const b = el('button', {
    text: label,
    onClick: () => onClick(),
    className: 'btn ' + (opts.className ?? ''),
  });
  if (opts.disabled) b.disabled = true;
  return b;
}

export function panel(title: string, body: HTMLElement): HTMLElement {
  return el('section', { className: 'panel' }, [
    el('h2', { text: title, className: 'panel-title' }),
    body,
  ]);
}

export function flashMessage(parent: HTMLElement, text: string, kind: 'ok' | 'warn' | 'err' = 'ok'): void {
  const msg = el('div', { className: `flash flash-${kind}`, text });
  parent.prepend(msg);
  setTimeout(() => msg.classList.add('flash-fade'), 1800);
  setTimeout(() => msg.remove(), 2400);
}

export function confirmModal(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = el('div', { className: 'modal-overlay' });
    const box = el('div', { className: 'modal' }, [
      el('p', { text: message }),
      el('div', { className: 'modal-buttons' }, [
        button('OK', () => {
          document.body.removeChild(overlay);
          resolve(true);
        }, { className: 'btn-primary' }),
        button('キャンセル', () => {
          document.body.removeChild(overlay);
          resolve(false);
        }),
      ]),
    ]);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}
