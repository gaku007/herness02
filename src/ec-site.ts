interface Goods {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  goods: Goods[];
}

interface CartItem {
  goodsId: number;
  goodsName: string;
  price: number;
  quantity: number;
}

export class ECSite {
  private events: Event[];
  private cart: Map<number, CartItem>;
  private currentEventIndex: number;

  constructor() {
    this.events = this.initializeEvents();
    this.cart = new Map();
    this.currentEventIndex = 0;
  }

  init(): void {
    this.setupEventListeners();
    this.renderGoods();
  }

  private initializeEvents(): Event[] {
    return [
      {
        id: 0,
        name: 'ライブイベント',
        description: '推し活の最高の瞬間をグッズで応援しよう！',
        goods: this.generateGoods(0, 'ライブグッズ'),
      },
      {
        id: 1,
        name: 'ファンミーティング',
        description: '推しとの一期一会の思い出を記念グッズで永遠に！',
        goods: this.generateGoods(1, 'ファンミ記念品'),
      },
      {
        id: 2,
        name: 'グッズ販売展',
        description: '限定グッズが一堂に集結！お気に入りを見つけよう！',
        goods: this.generateGoods(2, '限定グッズ'),
      },
    ];
  }

  private generateGoods(eventId: number, prefix: string): Goods[] {
    const goods: Goods[] = [];
    const emojis = [
      '🎸',
      '🎤',
      '🎧',
      '📀',
      '🖼️',
      '📱',
      '⌚',
      '👕',
      '🧢',
      '🎒',
      '🪒',
      '💄',
      '📚',
      '🍵',
      '🍰',
      '🌸',
      '⭐',
      '💎',
      '🎊',
      '🎁',
    ];

    for (let i = 0; i < 20; i++) {
      const goodsId = eventId * 100 + i;
      goods.push({
        id: goodsId,
        name: `${prefix}#${i + 1}`,
        price: 1000 + i * 100,
        emoji: emojis[i],
      });
    }

    return goods;
  }

  private setupEventListeners(): void {
    const eventButtons = document.querySelectorAll('.event-btn');
    for (const button of Array.from(eventButtons)) {
      button.addEventListener('click' as unknown as keyof ElementEventMap, (e: unknown) => {
        this.handleEventButtonClick(e as MouseEvent);
      });
    }
  }

  private handleEventButtonClick(e: MouseEvent): void {
    const target = e.target as HTMLButtonElement;
    const eventIndex = Number.parseInt(target.getAttribute('data-event') || '0', 10);

    // アクティブボタンの更新
    for (const btn of Array.from(document.querySelectorAll('.event-btn'))) {
      btn.classList.remove('active');
    }
    target.classList.add('active');

    // イベント変更とUI更新
    this.currentEventIndex = eventIndex;
    this.renderGoods();
  }

  private renderGoods(): void {
    const currentEvent = this.events[this.currentEventIndex];

    // イベント情報を更新
    const eventTitle = document.getElementById('eventTitle');
    const eventDescription = document.getElementById('eventDescription');

    if (eventTitle) {
      eventTitle.textContent = currentEvent.name;
    }
    if (eventDescription) {
      eventDescription.textContent = currentEvent.description;
    }

    // グッズグリッドを更新
    const goodsGrid = document.getElementById('goodsGrid');
    if (goodsGrid) {
      goodsGrid.innerHTML = '';

      for (const goods of currentEvent.goods) {
        const card = this.createGoodsCard(goods);
        goodsGrid.appendChild(card);
      }
    }
  }

  private createGoodsCard(goods: Goods): HTMLElement {
    const card = document.createElement('div');
    card.className = 'goods-card';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'goods-image';
    imageDiv.textContent = goods.emoji;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'goods-name';
    nameDiv.textContent = goods.name;

    const priceDiv = document.createElement('div');
    priceDiv.className = 'goods-price';
    priceDiv.textContent = `¥${goods.price.toLocaleString()}`;

    const button = document.createElement('button');
    button.className = 'add-to-cart-btn';
    button.textContent = 'カートに追加';
    button.addEventListener('click', () => {
      this.addToCart(goods);
    });

    card.appendChild(imageDiv);
    card.appendChild(nameDiv);
    card.appendChild(priceDiv);
    card.appendChild(button);

    return card;
  }

  private addToCart(goods: Goods): void {
    if (this.cart.has(goods.id)) {
      const item = this.cart.get(goods.id);
      if (item) {
        item.quantity += 1;
      }
    } else {
      this.cart.set(goods.id, {
        goodsId: goods.id,
        goodsName: goods.name,
        price: goods.price,
        quantity: 1,
      });
    }

    this.updateCartDisplay();
  }

  private updateCartDisplay(): void {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartTotalDiv = document.getElementById('cartTotal');

    if (!cartItemsDiv || !cartTotalDiv) {
      return;
    }

    if (this.cart.size === 0) {
      cartItemsDiv.innerHTML = '<div class="no-items">まだアイテムがありません</div>';
      cartTotalDiv.textContent = '';
      return;
    }

    let html = '';
    let totalPrice = 0;
    let totalQuantity = 0;

    for (const item of this.cart.values()) {
      const subtotal = item.price * item.quantity;
      html += `<div>
        ${item.goodsName} × ${item.quantity}
        <br />
        <span style="color: #667eea; font-weight: bold;">
          ¥${subtotal.toLocaleString()}
        </span>
      </div>`;
      totalPrice += subtotal;
      totalQuantity += item.quantity;
    }

    cartItemsDiv.innerHTML = html;
    cartTotalDiv.innerHTML = `
      合計: ${totalQuantity}点 ¥${totalPrice.toLocaleString()}
    `;
  }
}
