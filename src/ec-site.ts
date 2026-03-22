/**
 * EC Site - フロントエンド ロジック
 * DOM 操作、イベントハンドリング、API 通信を管理
 */

interface CartItem {
  productId: number;
  quantity: number;
}

interface CartWithDetails extends CartItem {
  name: string;
  price: number;
  stock: number;
}

interface EcEvent {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
}

interface Product {
  id: number;
  eventId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

// ===== グローバルステート =====
let currentEvent: EcEvent | null = null;
const currentProduct: Product | null = null;
let cart: CartItem[] = [];

// ===== ユーティリティ関数 =====

/**
 * ローカルストレージからカートを復元
 */
const loadCart = (): void => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartCount();
};

/**
 * カートをローカルストレージに保存
 */
const saveCart = (): void => {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
};

/**
 * カート数を更新
 */
const updateCartCount = (): void => {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = count.toString();
  }
};

/**
 * 画面切り替え
 */
const showScreen = (screenId: string): void => {
  const screens = document.querySelectorAll('.screen');
  for (const screen of Array.from(screens)) {
    screen.classList.remove('active');
  }

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    window.scrollTo(0, 0);
  }
};

/**
 * 金額をフォーマット
 */
const formatPrice = (price: number): string => {
  return `¥${price.toLocaleString()}`;
};

// ===== API 通信 =====

/**
 * すべてのイベントを取得
 */
const fetchEvents = async (): Promise<EcEvent[]> => {
  const response = await fetch('/api/events');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

/**
 * イベント別に商品を取得
 */
const fetchProducts = async (eventId: number): Promise<Product[]> => {
  const response = await fetch(`/api/products/event/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

/**
 * 商品詳細を取得
 */
const fetchProduct = async (productId: number): Promise<Product> => {
  const response = await fetch(`/api/product/${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
};

/**
 * すべての注文を取得
 */
const fetchOrders = async (): Promise<Order[]> => {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
};

/**
 * 注文を作成
 */
const submitOrder = async (
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: CartItem[]
): Promise<Order> => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName,
      customerEmail,
      customerPhone,
      items,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
};

// ===== 画面レンダリング =====

/**
 * ホーム画面（イベント一覧）をレンダリング
 */
const renderHomeScreen = async (): Promise<void> => {
  try {
    const events: EcEvent[] = await fetchEvents();
    const eventsGrid = document.getElementById('eventsGrid');

    if (!eventsGrid) return;

    eventsGrid.innerHTML = events
      .map(
        event => `
      <div class="event-card" onclick="showProductsForEvent(${event.id}, '${event.name}')">
        <h3>${event.name}</h3>
        <p>${event.description}</p>
        <p>📍 ${event.location}</p>
        <p class="date">📅 ${event.date}</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error rendering home screen:', error);
    const eventsGrid = document.getElementById('eventsGrid');
    if (eventsGrid) {
      eventsGrid.innerHTML = '<div class="empty-message">イベントの読み込みに失敗しました</div>';
    }
  }
};

/**
 * 商品一覧画面をレンダリング
 */
const renderProductsScreen = async (eventId: number, eventName: string): Promise<void> => {
  try {
    currentEvent = {
      id: eventId,
      name: eventName,
      description: '',
      date: '',
      location: '',
    } as EcEvent;
    const products = await fetchProducts(eventId);
    const productsGrid = document.getElementById('productsGrid');
    const productsTitle = document.getElementById('productsTitle');
    const currentEventName = document.getElementById('currentEventName');

    if (!productsGrid || !productsTitle || !currentEventName) return;

    productsTitle.textContent = `${eventName} - グッズ一覧`;
    currentEventName.textContent = eventName;

    productsGrid.innerHTML = products
      .map(
        product => `
      <div class="product-card">
        <div class="product-image">🎁</div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p class="product-category">カテゴリー：${product.category}</p>
          <p class="product-price">${formatPrice(product.price)}</p>
          <p class="product-stock">在庫：${product.stock}個</p>
          <button class="add-to-cart-btn" onclick="addToCartFromList(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>${product.stock === 0 ? '売切' : 'カートに追加'}</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error rendering products screen:', error);
  }
};

/**
 * カート画面をレンダリング
 */
const renderCartScreen = async (): Promise<void> => {
  const cartContent = document.getElementById('cartContent');
  if (!cartContent) return;

  if (cart.length === 0) {
    cartContent.innerHTML = '<div class="empty-message">カートは空です</div>';
    return;
  }

  try {
    // カートアイテムの詳細情報を取得
    const cartDetails: CartWithDetails[] = [];
    let totalPrice = 0;

    for (const item of cart) {
      const product = await fetchProduct(item.productId);
      const itemPrice = product.price * item.quantity;
      totalPrice += itemPrice;
      cartDetails.push({
        ...item,
        name: product.name,
        price: product.price,
        stock: product.stock,
      });
    }

    const cartItemsHtml = cartDetails
      .map(
        item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>単価：${formatPrice(item.price)}</p>
          <p>小計：${formatPrice(item.price * item.quantity)}</p>
        </div>
        <div class="cart-item-controls">
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.stock}" onchange="updateCartQuantity(${item.productId}, this.value)">
          <button class="remove-btn" onclick="removeFromCart(${item.productId})">削除</button>
        </div>
      </div>
    `
      )
      .join('');

    cartContent.innerHTML = `
      <div class="cart-container">
        <div class="cart-items">
          <h3>カート内容</h3>
          ${cartItemsHtml}
        </div>
        <div class="cart-summary">
          <h3>注文内容</h3>
          <div class="summary-line">
            <span>商品数：</span>
            <span>${cart.reduce((sum, item) => sum + item.quantity, 0)}個</span>
          </div>
          <div class="summary-line total">
            <span>合計金額：</span>
            <span>${formatPrice(totalPrice)}</span>
          </div>
          <button class="checkout-btn" onclick="proceedToCheckout()">レジに進む</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering cart screen:', error);
    cartContent.innerHTML = '<div class="empty-message">カートの読み込みに失敗しました</div>';
  }
};

/**
 * 注文履歴画面をレンダリング
 */
const renderOrdersScreen = async (): Promise<void> => {
  const ordersContent = document.getElementById('ordersContent');
  if (!ordersContent) return;

  try {
    const orders = await fetchOrders();

    if (orders.length === 0) {
      ordersContent.innerHTML = '<div class="empty-message">注文履歴はありません</div>';
      return;
    }

    const ordersHtml = `
      <table class="orders-table">
        <thead>
          <tr>
            <th>注文番号</th>
            <th>顧客名</th>
            <th>合計金額</th>
            <th>注文日時</th>
            <th>ステータス</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              order => `
            <tr>
              <td>#${order.id}</td>
              <td>${order.customerName}</td>
              <td>${formatPrice(order.totalPrice)}</td>
              <td>${new Date(order.createdAt).toLocaleString('ja-JP')}</td>
              <td>${order.status}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
    ordersContent.innerHTML = ordersHtml;
  } catch (error) {
    console.error('Error rendering orders screen:', error);
    ordersContent.innerHTML = '<div class="empty-message">注文履歴の読み込みに失敗しました</div>';
  }
};

// ===== カート操作 =====

/**
 * カートに商品を追加（一覧から）
 */
const addToCartFromList = (productId: number): void => {
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  saveCart();
  alert('カートに追加しました');
};

/**
 * カートの数量を更新
 */
const updateCartQuantity = (productId: number, quantity: string): void => {
  const qty = Number(quantity);
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find(item => item.productId === productId);
  if (item) {
    item.quantity = qty;
    saveCart();
    renderCartScreen();
  }
};

/**
 * カートから商品を削除
 */
const removeFromCart = (productId: number): void => {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
  renderCartScreen();
};

// ===== ナビゲーション =====

/**
 * イベント選択時
 */
const showProductsForEvent = (eventId: number, eventName: string): void => {
  renderProductsScreen(eventId, eventName);
  showScreen('productsScreen');
};

/**
 * チェックアウト画面へ
 */
const proceedToCheckout = (): void => {
  if (cart.length === 0) {
    alert('カートが空です');
    return;
  }

  const totalPrice = 0;
  for (const item of cart) {
    // ここで商品情報を取得して合計を計算
  }

  // 非同期で合計を計算
  (async () => {
    let totalPrice = 0;
    for (const item of cart) {
      const product = await fetchProduct(item.productId);
      totalPrice += product.price * item.quantity;
    }

    const checkoutTotal = document.getElementById('checkoutTotal');
    if (checkoutTotal) {
      checkoutTotal.textContent = formatPrice(totalPrice);
    }
  })();

  showScreen('checkoutScreen');
};

/**
 * 注文を確定
 */
const submitCheckoutForm = async (event: Event): Promise<void> => {
  event.preventDefault();

  const customerName = (document.getElementById('customerName') as HTMLInputElement).value;
  const customerEmail = (document.getElementById('customerEmail') as HTMLInputElement).value;
  const customerPhone = (document.getElementById('customerPhone') as HTMLInputElement).value;

  if (!customerName || !customerEmail || !customerPhone) {
    const checkoutError = document.getElementById('checkoutError');
    if (checkoutError) {
      checkoutError.innerHTML = '<div class="error-message">すべての項目を入力してください</div>';
    }
    return;
  }

  try {
    const order = await submitOrder(customerName, customerEmail, customerPhone, cart);

    const orderNumber = document.getElementById('orderNumber');
    if (orderNumber) {
      orderNumber.textContent = `#${order.id}`;
    }

    // カートをクリア
    cart = [];
    saveCart();

    showScreen('completionScreen');
  } catch (error) {
    const checkoutError = document.getElementById('checkoutError');
    if (checkoutError) {
      checkoutError.innerHTML = `<div class="error-message">${error instanceof Error ? error.message : 'エラーが発生しました'}</div>`;
    }
  }
};

// ===== イベントリスナー登録 =====

const initializeEventListeners = (): void => {
  // ナビゲーションボタン
  document.getElementById('homeBtn')?.addEventListener('click', () => {
    showScreen('homeScreen');
  });

  document.getElementById('cartBtn')?.addEventListener('click', () => {
    renderCartScreen();
    showScreen('cartScreen');
  });

  document.getElementById('ordersBtn')?.addEventListener('click', () => {
    renderOrdersScreen();
    showScreen('ordersScreen');
  });

  // ブレッドクラムボタン
  document.getElementById('backToEventsBtn')?.addEventListener('click', () => {
    showScreen('homeScreen');
  });

  document.getElementById('backToProductsBtn')?.addEventListener('click', () => {
    if (currentEvent) {
      renderProductsScreen(currentEvent.id, currentEvent.name);
      showScreen('productsScreen');
    }
  });

  // チェックアウト
  document.getElementById('checkoutForm')?.addEventListener('submit', submitCheckoutForm);

  document.getElementById('backToCartBtn')?.addEventListener('click', () => {
    renderCartScreen();
    showScreen('cartScreen');
  });

  // 完了画面
  document.getElementById('backToHomeBtn')?.addEventListener('click', () => {
    renderHomeScreen();
    showScreen('homeScreen');
  });
};

// ===== 初期化 =====

const initialize = (): void => {
  loadCart();
  renderHomeScreen();
  initializeEventListeners();
};

// ページロード時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
