(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const STORE = 'geolab-offer-v1';
  const SEQ = 'geolab-offer-seq';

  const el = {
    name: $('#client-name'), scope: $('#client-scope'), date: $('#offer-date'),
    ref: $('#offer-ref'), currency: $('#currency'), items: $('#items'),
    taxToggle: $('#tax-toggle'), taxRate: $('#tax-rate'), taxWrap: $('#tax-rate-wrap'),
    tpl: $('#item-tpl'),
  };

  const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const newRef = () => {
    const n = (parseInt(localStorage.getItem(SEQ) || '0', 10) + 1);
    localStorage.setItem(SEQ, n);
    return `OFFER-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
  };
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const money = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: el.currency.value, minimumFractionDigits: 2 }).format(v);
  const fmtDate = v => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const defaults = () => ({
    name: '', scope: '', date: today(), ref: newRef(), currency: 'GEL',
    tax: false, rate: 18,
    items: [{ name: 'AI Strategy Workshop', sku: 'AI-WS-01', qty: 1, price: 2500 }],
  });

  function addItem(data = { name: '', sku: '', qty: 1, price: '' }) {
    const row = el.tpl.content.firstElementChild.cloneNode(true);
    $('.i-name', row).value = data.name;
    $('.i-sku', row).value = data.sku;
    $('.i-qty', row).value = data.qty;
    $('.i-price', row).value = data.price;
    el.items.appendChild(row);
    return row;
  }

  function readItems() {
    return [...el.items.children].map(r => ({
      row: r,
      name: $('.i-name', r).value.trim(),
      sku: $('.i-sku', r).value.trim(),
      qty: num($('.i-qty', r).value),
      price: num($('.i-price', r).value),
    }));
  }

  function calc() {
    const items = readItems();
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const rate = el.taxToggle.checked ? num(el.taxRate.value) : 0;
    const tax = subtotal * rate / 100;
    return { items, subtotal, rate, tax, total: subtotal + tax };
  }

  function render() {
    const c = calc();
    const ph = t => `<span class="placeholder">${t}</span>`;

    c.items.forEach(i => { $('.i-total', i.row).textContent = money(i.qty * i.price); });
    $('#mini-subtotal').textContent = money(c.subtotal);
    $('#mini-tax').textContent = money(c.tax);
    $('#mini-total').textContent = money(c.total);
    $('#mini-tax-row').hidden = !el.taxToggle.checked;
    el.taxWrap.classList.toggle('disabled', !el.taxToggle.checked);

    $('#p-ref').textContent = el.ref.value || '—';
    $('#p-date').textContent = fmtDate(el.date.value);
    $('#p-client').innerHTML = el.name.value.trim() ? esc(el.name.value) : ph('Client organization name');
    $('#p-client-sig').textContent = el.name.value.trim() || 'Client';
    $('#p-scope').textContent = el.scope.value.trim();

    const rows = c.items.filter(i => i.name || i.sku || i.price);
    $('#p-items').innerHTML = rows.length ? rows.map((i, n) => `
      <tr>
        <td>${String(n + 1).padStart(2, '0')}</td>
        <td class="name">${i.name ? esc(i.name) : ph('Untitled item')}</td>
        <td class="sku">${esc(i.sku) || '—'}</td>
        <td class="r">${i.qty}</td>
        <td class="r">${money(i.price)}</td>
        <td class="r"><strong>${money(i.qty * i.price)}</strong></td>
      </tr>`).join('') : `<tr><td colspan="6" class="empty">No line items yet — add products or services.</td></tr>`;

    $('#p-subtotal').textContent = money(c.subtotal);
    $('#p-tax-row').hidden = !el.taxToggle.checked;
    $('#p-tax-label').textContent = `VAT (${c.rate}%)`;
    $('#p-tax').textContent = money(c.tax);
    $('#p-total').textContent = money(c.total);

    save(c);
  }

  function save(c) {
    localStorage.setItem(STORE, JSON.stringify({
      name: el.name.value, scope: el.scope.value, date: el.date.value, ref: el.ref.value,
      currency: el.currency.value, tax: el.taxToggle.checked, rate: el.taxRate.value,
      items: c.items.map(({ name, sku, qty, price }) => ({ name, sku, qty, price })),
    }));
  }

  function load(s) {
    el.name.value = s.name; el.scope.value = s.scope; el.date.value = s.date;
    el.ref.value = s.ref; el.currency.value = s.currency;
    el.taxToggle.checked = s.tax; el.taxRate.value = s.rate;
    el.items.innerHTML = '';
    (s.items.length ? s.items : [{ name: '', sku: '', qty: 1, price: '' }]).forEach(addItem);
    render();
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2000);
  }

  function summaryText() {
    const c = calc();
    const lines = [
      `${el.ref.value} — ${fmtDate(el.date.value)}`,
      `Client: ${el.name.value || '—'}`,
      '',
      ...c.items.filter(i => i.name || i.price).map((i, n) =>
        `${n + 1}. ${i.name || 'Untitled'}${i.sku ? ` [${i.sku}]` : ''} — ${i.qty} × ${money(i.price)} = ${money(i.qty * i.price)}`),
      '',
      `Subtotal: ${money(c.subtotal)}`,
      ...(el.taxToggle.checked ? [`VAT (${c.rate}%): ${money(c.tax)}`] : []),
      `Grand Total: ${money(c.total)}`,
      '',
      'GeoLab · The art of using AI',
    ];
    return lines.join('\n');
  }

  // Scale A4 preview to fit panel width
  function fit() {
    const doc = $('#doc'), panel = $('#panel-preview');
    doc.style.transform = '';
    const avail = panel.clientWidth - 8, w = doc.offsetWidth;
    const s = Math.min(1, avail / w);
    doc.style.transform = s < 1 ? `scale(${s})` : '';
    doc.style.marginBottom = s < 1 ? `${-(doc.offsetHeight * (1 - s))}px` : '';
  }

  // Events
  $('#offer-form').addEventListener('input', render);
  $('#offer-form').addEventListener('change', render);
  el.items.addEventListener('click', e => {
    if (!e.target.closest('.i-del')) return;
    e.target.closest('.item-row').remove();
    if (!el.items.children.length) addItem();
    render();
  });
  $('#btn-add').addEventListener('click', () => { $('.i-name', addItem()).focus(); render(); });
  $('#btn-regen').addEventListener('click', () => { el.ref.value = newRef(); render(); });
  $('#btn-print').addEventListener('click', () => window.print());
  $('#btn-reset').addEventListener('click', () => {
    if (confirm('Reset the form to its default state?')) { load(defaults()); toast('Form reset'); }
  });
  $('#btn-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(summaryText()); toast('Summary copied to clipboard'); }
    catch { toast('Copy failed — clipboard unavailable'); }
  });
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    $('.layout').dataset.view = t.dataset.target;
    fit();
  }));
  window.addEventListener('beforeprint', () => { $('#doc').style.transform = ''; $('#doc').style.marginBottom = ''; });
  window.addEventListener('afterprint', fit);
  new ResizeObserver(fit).observe($('#panel-preview'));

  $('.layout').dataset.view = 'form';
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORE)); } catch {}
  load(saved || defaults());
})();
