// 《数字华容道·诗词版》 - Service Worker
// 版本: v1.0.0
// 最后更新: 2026-02-26

const CACHE_NAME = 'poem-2048-v1.0.0';
const OFFLINE_URL = '/offline.html';

// 需要缓存的资源列表
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/game.js',
  '/js/grid.js',
  '/js/tiles.js',
  '/js/score.js',
  '/js/levels.js',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/fonts/chinese.woff2',
  '/assets/sounds/click.mp3',
  '/assets/sounds/merge.mp3',
  '/assets/sounds/victory.mp3'
];

// 安装事件 - 预缓存关键资源
self.addEventListener('install', event => {
  console.log('[Service Worker] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 缓存关键资源');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] 安装完成');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] 安装失败:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] 激活中...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] 激活完成');
      return self.clients.claim();
    })
  );
});

// 获取事件 - 网络优先，缓存备用策略
self.addEventListener('fetch', event => {
  // 跳过非GET请求和浏览器扩展请求
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.includes('sockjs-node')) {
    return;
  }

  // 处理API请求
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 克隆响应以同时缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // 网络失败时尝试从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }

  // 处理静态资源请求
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 网络优先策略
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // 更新缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            return networkResponse;
          })
          .catch(error => {
            console.log('[Service Worker] 网络请求失败:', error);
            
            // 如果是页面请求且缓存中没有，显示离线页面
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL) || 
                     caches.match('/index.html');
            }
            
            // 返回缓存的响应或空响应
            return cachedResponse || 
                   new Response('网络连接失败', {
                     status: 408,
                     headers: { 'Content-Type': 'text/plain' }
                   });
          });

        // 如果缓存中有，立即返回，同时更新缓存
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetchPromise;
      })
  );
});

// 消息处理
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(success => {
        event.ports[0].postMessage({ success });
      });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.keys();
      })
      .then(requests => {
        event.ports[0].postMessage({ 
          size: requests.length,
          cacheName: CACHE_NAME 
        });
      });
  }
});

// 推送通知处理
self.addEventListener('push', event => {
  console.log('[Service Worker] 收到推送通知');
  
  const options = {
    body: event.data ? event.data.text() : '《数字华容道·诗词版》有新消息',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'play',
        title: '开始游戏',
        icon: '/assets/icons/play-96.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/assets/icons/close-96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('数字华容道·诗词版', options)
  );
});

// 通知点击处理
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] 通知被点击:', event.notification.tag);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // 如果已经有打开的窗口，聚焦它
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// 后台同步处理
self.addEventListener('sync', event => {
  console.log('[Service Worker] 后台同步:', event.tag);
  
  if (event.tag === 'sync-game-data') {
    event.waitUntil(syncGameData());
  }
});

// 同步游戏数据函数
function syncGameData() {
  return new Promise((resolve, reject) => {
    // 这里可以添加游戏数据同步逻辑
    console.log('[Service Worker] 同步游戏数据...');
    
    // 模拟同步完成
    setTimeout(() => {
      console.log('[Service Worker] 游戏数据同步完成');
      resolve();
    }, 1000);
  });
}

// 错误处理
self.addEventListener('error', event => {
  console.error('[Service Worker] 错误:', event.error);
});

// 未处理的Promise拒绝
self.addEventListener('unhandledrejection', event => {
  console.error('[Service Worker] 未处理的Promise拒绝:', event.reason);
});

// 性能监控
const performanceEntries = [];
self.addEventListener('performanceentry', event => {
  performanceEntries.push(event.entry);
  
  // 每10个条目发送一次报告
  if (performanceEntries.length >= 10) {
    sendPerformanceReport(performanceEntries);
    performanceEntries.length = 0;
  }
});

function sendPerformanceReport(entries) {
  // 这里可以添加性能数据上报逻辑
  console.log('[Service Worker] 性能报告:', entries);
}