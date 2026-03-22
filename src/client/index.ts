import type {
  ApiResponse,
  BuyerInfo,
  Cart,
  CartItem,
  Event,
  Order,
  Product,
} from '../types/index.js';

// ====== ユーティリティ ======

interface CurrentState {
  cartItems: CartItem[];
  currentEvent: Event | null;
  currentEventId: string | null;
}

const state: CurrentState = {
  cartItems: [],
  currentEvent: null,
  currentEventId: null,
};

// ローカルストレージからカートを復元
function loadCartFromStorage(): void {
  const stored = localStorage.getItem('cart');
  if (stored) {
    try {
      state.cartItems = JSON.parse(stored);
      updateCartBadge();
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    }
  }
}

// ローカルストレージにカートを保存
function saveCartToStorage(): void {
  localStorage.setItem('cart', JSON.stringify(state.cartItems));
  updateCartBadge();
}

// カートバッジの更新
function updateCartBadge(): void {
  const cartCount = state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = cartCount.toString();
  }
}

// 価格フォーマット
function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

// ページ遷移
function navigateTo(page: string): void {
  const pages = document.querySelectorAll('.page');
  for (const p of Array.from(pages)) {
    p.classList.remove('active');
  }

  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // ナビゲーションボタンのアクティブ状態を更新
  const navBtns = document.querySelectorAll('.nav-btn');
  for (const btn of Array.from(navBtns)) {
    btn.classList.remove('active');
  }

  const activeNavBtn = document.querySelector(`[data-page='${page}']`);
  if (activeNavBtn) {
    activeNavBtn.classList.add('active');
  }
}

// ====== API 呼び出し ======

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events');
  const data: ApiResponse<Event[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch events');
  }
  return data.data;
}

async function fetchProducts(eventId?: string): Promise<Product[]> {
  const url = eventId ? `/api/products?eventId=${eventId}` : '/api/products';
  const response = await fetch(url);
  const data: ApiResponse<Product[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch products');
  }
  return data.data;
}

async function fetchProduct(productId: string): Promise<Product> {
  const response = await fetch(`/api/products/${productId}`);
  const data: ApiResponse<Product> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch product');
  }
  return data.data;
}

async function createOrder(buyerInfo: BuyerInfo, items: CartItem[]): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ buyerInfo, items }),
  });
  const data: ApiResponse<Order> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to create order');
  }
  return data.data;
}

async function fetchOrders(email: string): Promise<Order[]> {
  const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
  const data: ApiResponse<Order[]> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch orders');
  }
  return data.data;
}

// ====== UI レンダリング ======

async function renderEvents(): Promise<void> {
  const container = document.getElementById('events-container');
  if (!container) return;

  try {
    const events = await fetchEvents();
    container.innerHTML = events
      .map(
        event => `
        <div class='event-card' onclick='window.handleSelectEvent("${event.id}")'>
          <img src='${event.thumbnail}' alt='${event.name}' class='event-image' />
          <div class='event-info'>
            <h3>${event.name}</h3>
            <div class='event-date'>${new Date(event.date).toLocaleDateString('ja-JP')}</div>
            <p class='event-description'>${event.description}</p>
          </div>
        </div>
      `
      )
      .join('');
  } catch (error) {
    container.innerHTML = `<p>イベント読み込みエラー: ${String(error)}</p>`;
  }
}

async function renderProducts(eventId: string): Promise<void> {
  const container = document.getElementById('products-container');
  const titleElement = document.getElementById('products-title');

  if (!container) return;

  try {
    const event = await fetch(`/api/events/${eventId}`)
      .then(res => res.json())
      .then((data: ApiResponse<Event>) => data.data);

    if (titleElement && event) {
      titleElement.textContent = `${event.name} - 商品一覧`;
    }

    const products = await fetchProducts(eventId);

    // カテゴリーフィルター用のカテゴリー一覧を取得
    const categories = Array.from(
      new Set(products.map(p => p.category).filter(Boolean))
    ) as string[];
    const categoryFilter = document.getElementById('product-category-filter') as HTMLSelectElement;
    if (categoryFilter) {
      categoryFilter.innerHTML = `<option value="">カテゴリー全て</option>${categories
        .map(cat => `<option value='${cat}'>${cat}</option>`)
        .join('')}`;
    }

    // フィルターを適用してレンダリング
    renderFilteredProducts(products);

    // フィルターイベントリスナーを設定
    const typeFilter = document.getElementById('product-type-filter') as HTMLSelectElement;
    if (typeFilter) {
      typeFilter.onchange = () => renderFilteredProducts(products);
    }
    if (categoryFilter) {
      categoryFilter.onchange = () => renderFilteredProducts(products);
    }
  } catch (error) {
    container.innerHTML = `<p>商品読み込みエラー: ${String(error)}</p>`;
  }
}

function renderFilteredProducts(products: Product[]): void {
  const container = document.getElementById('products-container');
  if (!container) return;

  const typeFilter =
    (document.getElementById('product-type-filter') as HTMLSelectElement)?.value || '';
  const categoryFilter =
    (document.getElementById('product-category-filter') as HTMLSelectElement)?.value || '';

  const filtered = products.filter(p => {
    const typeMatch = !typeFilter || p.type === typeFilter;
    const categoryMatch = !categoryFilter || p.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  container.innerHTML = filtered
    .map(
      product => `
      <div class='product-card'>
        <img src='${product.image}' alt='${product.name}' class='product-image' />
        <div class='product-info'>
          <span class='product-type-badge ${product.type}'>${product.type === 'ticket' ? 'チケット' : 'グッズ'}</span>
          <h4 class='product-name'>${product.name}</h4>
          ${product.category ? `<div class='product-category'>${product.category}</div>` : ''}
          <p class='product-description'>${product.description}</p>
          <div class='product-footer'>
            <div class='product-price'>${formatPrice(product.price)}</div>
            <div class='product-stock ${product.stock < 10 ? 'low' : ''}'>${product.stock}個在庫</div>
          </div>
        </div>
        <button class='btn btn-primary' onclick='window.handleAddToCart("${product.id}", "${product.name}", ${product.price})'>
          カートに追加
        </button>
      </div>
    `
    )
    .join('');
}

function renderCart(): void {
  const itemsContainer = document.getElementById('cart-items-tbody');
  const emptyMessage = document.getElementById('empty-cart-message');
  const cartContent = document.getElementById('cart-content');

  if (!itemsContainer || !emptyMessage || !cartContent) return;

  if (state.cartItems.length === 0) {
    cartContent.style.display = 'none';
    emptyMessage.style.display = 'block';
  } else {
    cartContent.style.display = 'block';
    emptyMessage.style.display = 'none';

    itemsContainer.innerHTML = state.cartItems
      .map(
        (item, index) => `
        <tr>
          <td>${item.name}</td>
          <td>${formatPrice(item.price)}</td>
          <td>
            <input type='number' min='1' value='${item.quantity}' 
              onchange='window.handleUpdateCartQuantity(${index}, this.value)' />
          </td>
          <td>${formatPrice(item.price * item.quantity)}</td>
          <td>
            <button class='btn btn-danger' onclick='window.handleRemoveFromCart(${index})'>
              削除
            </button>
          </td>
        </tr>
      `
      )
      .join('');

    // 合計を更新
    const total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
      totalElement.textContent = formatPrice(total);
    }
  }
}

function renderCheckout(): void {
  const itemsContainer = document.getElementById('checkout-items-tbody');
  const totalElement = document.getElementById('checkout-total');

  if (!itemsContainer || !totalElement) return;

  itemsContainer.innerHTML = state.cartItems
    .map(
      item => `
      <tr>
        <td>${item.name}</td>
        <td>${formatPrice(item.price)}</td>
        <td>${item.quantity}</td>
        <td>${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join('');

  const total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalElement.textContent = formatPrice(total);
}

async function renderOrders(): Promise<void> {
  const container = document.getElementById('orders-container');
  if (!container) return;

  try {
    const email = (document.getElementById('order-search-email') as HTMLInputElement)?.value;
    if (!email) {
      container.innerHTML = '<p>メールアドレスを入力して検索してください</p>';
      return;
    }

    const orders = await fetchOrders(email);

    if (orders.length === 0) {
      container.innerHTML = '<p>該当する注文履歴がありません</p>';
      return;
    }

    container.innerHTML = orders
      .map(
        order => `
        <div class='order-item'>
          <div class='order-header'>
            <div>
              <p><strong>注文ID:</strong> ${order.id}</p>
              <p><strong>注文日:</strong> ${new Date(order.createdAt).toLocaleDateString('ja-JP')}</p>
              <p><strong>氏名:</strong> ${order.buyerInfo.name}</p>
            </div>
            <span class='order-status ${order.status}'>${order.status === 'completed' ? '完了' : order.status}</span>
          </div>
          <ul class='order-items-list'>
            ${order.items.map(item => `<li><span>${item.name} × ${item.quantity}</span><span>${formatPrice(item.price * item.quantity)}</span></li>`).join('')}
          </ul>
          <div class='order-total'>${formatPrice(order.totalAmount)}</div>
        </div>
      `
      )
      .join('');
  } catch (error) {
    container.innerHTML = `<p>注文履歴読み込みエラー: ${String(error)}</p>`;
  }
}

// ====== イベントハンドラー ======

window.handleSelectEvent = async (eventId: string) => {
  state.currentEventId = eventId;
  navigateTo('products');
  await renderProducts(eventId);
};

window.handleAddToCart = async (productId: string, productName: string, price: number) => {
  const product = await fetchProduct(productId);

  // 在庫確認
  if (product.stock <= 0) {
    alert('この商品は在庫がありません');
    return;
  }

  const existingItem = state.cartItems.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cartItems.push({
      productId,
      name: productName,
      price,
      quantity: 1,
    });
  }

  saveCartToStorage();
  alert('カートに追加しました');
};

window.handleUpdateCartQuantity = (index: number, newQuantity: string) => {
  const quantity = Number.parseInt(newQuantity);
  if (quantity <= 0) {
    state.cartItems.splice(index, 1);
  } else {
    state.cartItems[index].quantity = quantity;
  }
  saveCartToStorage();
  renderCart();
};

window.handleRemoveFromCart = (index: number) => {
  state.cartItems.splice(index, 1);
  saveCartToStorage();
  renderCart();
};

window.handleProceedToCheckout = () => {
  if (state.cartItems.length === 0) {
    alert('カートは空です');
    return;
  }
  navigateTo('checkout');
  renderCheckout();
};

window.handlePlaceOrder = async () => {
  const buyerForm = document.getElementById('buyer-form') as HTMLFormElement;
  if (!buyerForm) return;

  const formData = new FormData(buyerForm);
  const buyerInfo: BuyerInfo = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phoneNumber: formData.get('phoneNumber') as string,
    address: formData.get('address') as string,
    postalCode: formData.get('postalCode') as string,
  };

  try {
    const order = await createOrder(buyerInfo, state.cartItems);

    // 注文成功時、カートをクリア
    state.cartItems = [];
    saveCartToStorage();

    // 購入完了画面に遷移
    navigateTo('order-complete');

    // 完了画面の情報を表示
    const orderIdDisplay = document.getElementById('order-id-display');
    const orderDateDisplay = document.getElementById('order-date-display');
    const orderTotalDisplay = document.getElementById('order-total-display');

    if (orderIdDisplay) orderIdDisplay.textContent = order.id;
    if (orderDateDisplay)
      orderDateDisplay.textContent = new Date(order.createdAt).toLocaleString('ja-JP');
    if (orderTotalDisplay) orderTotalDisplay.textContent = formatPrice(order.totalAmount);
  } catch (error) {
    alert(`注文エラー: ${String(error)}`);
  }
};

window.handleSearchOrders = async () => {
  navigateTo('orders');
  await renderOrders();
};

// ====== ページ初期化 ======

function initializeEventListeners(): void {
  // ナビゲーション
  document.getElementById('events-nav-btn')?.addEventListener('click', () => navigateTo('events'));
  document.getElementById('cart-nav-btn')?.addEventListener('click', () => {
    navigateTo('cart');
    renderCart();
  });
  document.getElementById('orders-nav-btn')?.addEventListener('click', () => navigateTo('orders'));

  // イベント一覧
  document
    .getElementById('back-to-events-btn')
    ?.addEventListener('click', () => navigateTo('events'));

  // カート
  document
    .getElementById('proceed-to-checkout-btn')
    ?.addEventListener('click', window.handleProceedToCheckout);
  document
    .getElementById('continue-shopping-btn')
    ?.addEventListener('click', () => navigateTo('products'));
  document
    .getElementById('go-to-events-btn')
    ?.addEventListener('click', () => navigateTo('events'));

  // チェックアウト
  document.getElementById('place-order-btn')?.addEventListener('click', window.handlePlaceOrder);
  document.getElementById('back-to-cart-btn')?.addEventListener('click', () => {
    navigateTo('cart');
    renderCart();
  });

  // 購入完了
  document
    .getElementById('view-order-history-btn')
    ?.addEventListener('click', window.handleSearchOrders);
  document
    .getElementById('continue-shopping-btn-2')
    ?.addEventListener('click', () => navigateTo('events'));

  // 注文履歴
  document
    .getElementById('search-orders-btn')
    ?.addEventListener('click', window.handleSearchOrders);
  (document.getElementById('order-search-email') as HTMLInputElement)?.addEventListener(
    'keypress',
    e => {
      if (e.key === 'Enter') {
        window.handleSearchOrders();
      }
    }
  );
}

async function initializeApp(): Promise<void> {
  loadCartFromStorage();
  initializeEventListeners();
  await renderEvents();
  navigateTo('events');
}

// グローバルスコープに関数を公開（HTML onclickから呼び出せるように）
declare global {
  interface Window {
    handleSelectEvent: (eventId: string) => Promise<void>;
    handleAddToCart: (productId: string, productName: string, price: number) => Promise<void>;
    handleUpdateCartQuantity: (index: number, quantity: string) => void;
    handleRemoveFromCart: (index: number) => void;
    handleProceedToCheckout: () => void;
    handlePlaceOrder: () => Promise<void>;
    handleSearchOrders: () => Promise<void>;
  }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', initializeApp);
