/**
 * AdminDashboard.jsx
 * ---------------------------------------------------------------------------
 * StoneRate — Admin Dashboard (mobile-first operations command center)
 *
 * Structure of this file:
 *   1. Small utilities (tone tokens, time formatting)
 *   2. Reusable presentational components
 *        SummaryCard | AttentionItem | OperationButton | NotificationButton
 *        SideMenuItem | BottomNavItem | LoadingState | EmptyState | ErrorState
 *   3. AdminDashboard — the exported page component
 *
 * Data flow: all values come from `dashboardApi.fetchDashboard()` in
 * src/data/dashboardData.js. Swap that mock for a real endpoint and the page
 * works unchanged. Navigation is funnelled through a single `navigate()`
 * handler so it can be replaced with react-router's useNavigate().
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../components/Icons';
import {
  BOTTOM_NAV_ITEMS,
  MENU_ITEMS,
  OPERATION_ACTIONS,
  USER_REGISTRATION_FILTERS,
  dashboardApi,
} from '../data/dashboardData';
import './AdminDashboard.css';

/* ===========================================================================
 * 1. Utilities
 * ========================================================================= */

/** Maps a semantic tone name to the CSS custom properties used by cards. */
const TONE_VARS = {
  amber: {
    '--sr-tone': 'var(--sr-amber)',
    '--sr-tone-soft': 'var(--sr-amber-soft)',
    '--sr-tone-ink': 'var(--sr-amber-ink)',
    '--sr-tone-border': 'rgba(224, 139, 30, 0.24)',
  },
  blue: {
    '--sr-tone': 'var(--sr-blue)',
    '--sr-tone-soft': 'var(--sr-blue-soft)',
    '--sr-tone-ink': 'var(--sr-blue-ink)',
    '--sr-tone-border': 'rgba(47, 111, 208, 0.2)',
  },
  green: {
    '--sr-tone': 'var(--sr-green)',
    '--sr-tone-soft': 'var(--sr-green-soft)',
    '--sr-tone-ink': 'var(--sr-green-ink)',
    '--sr-tone-border': 'rgba(31, 148, 99, 0.2)',
  },
  red: {
    '--sr-tone': 'var(--sr-red)',
    '--sr-tone-soft': 'var(--sr-red-soft)',
    '--sr-tone-ink': 'var(--sr-red-ink)',
    '--sr-tone-border': 'rgba(214, 69, 69, 0.22)',
  },
};

function toneStyle(tone = 'blue', extra = {}) {
  return { ...(TONE_VARS[tone] || TONE_VARS.blue), ...extra };
}

/** Indicator chips reuse the same palette under different variable names. */
function indicatorStyle(tone = 'amber') {
  const t = TONE_VARS[tone] || TONE_VARS.amber;
  return {
    '--sr-ind-soft': t['--sr-tone-soft'],
    '--sr-ind-ink': t['--sr-tone-ink'],
    '--sr-ind-border': t['--sr-tone-border'],
  };
}

function formatClock(isoString) {
  if (!isoString) return '--:--';
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* Severity ranking so the most urgent attention items always float to the top. */
const SEVERITY_RANK = { red: 0, amber: 1, blue: 2, green: 3 };

/* ===========================================================================
 * 2. Reusable components
 * ========================================================================= */

/** Notification bell with an unread indicator. */
export function NotificationButton({ unreadCount = 0, onClick }) {
  const hasUnread = unreadCount > 0;
  return (
    <button
      type="button"
      className="sr-iconbtn"
      onClick={onClick}
      aria-label={hasUnread ? `Notifications, ${unreadCount} unread` : 'Notifications'}
    >
      <Icon name="bell" size={19} />
      {hasUnread && (
        <span className="sr-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
    </button>
  );
}

/** Dashboard summary metric. Tapping opens the matching filtered page. */
export function SummaryCard({ stat, onSelect, style }) {
  const { label, value, unit, icon, tone, trend, indicator } = stat;

  return (
    <button
      type="button"
      className="sr-card"
      style={toneStyle(tone, style)}
      onClick={() => onSelect(stat)}
      aria-label={`${label}: ${value}`}
    >
      <div className="sr-card__top">
        <span className="sr-card__icon">
          <Icon name={icon} size={17} />
        </span>
        {trend && (
          <span
            className={`sr-card__trend ${
              trend.direction === 'up' ? 'sr-card__trend--up' : ''
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div>
        <div className="sr-card__value">
          {value}
          {unit}
        </div>
        <div className="sr-card__label">{label}</div>
      </div>

      {indicator && (
        <span className="sr-card__indicator" style={indicatorStyle(indicator.tone)}>
          <b>{indicator.value}</b> {indicator.label}
        </span>
      )}
    </button>
  );
}

/** One row inside "Attention Required". */
export function AttentionItem({ item, onAction, style }) {
  const { severity, title, detail, icon, actionLabel, age } = item;

  return (
    <article className="sr-attn" style={toneStyle(severity, style)}>
      <span className="sr-attn__icon">
        <Icon name={icon} size={16} />
      </span>

      <div className="sr-attn__body">
        <h3 className="sr-attn__title">{title}</h3>
        <p className="sr-attn__detail">{detail}</p>

        <div className="sr-attn__foot">
          <button
            type="button"
            className="sr-attn__action"
            onClick={() => onAction(item)}
          >
            {actionLabel}
            <Icon name="chevronRight" size={13} />
          </button>
          <span className="sr-attn__age">{age}</span>
        </div>
      </div>
    </article>
  );
}

/** Large primary operation entry point. */
export function OperationButton({ action, onSelect, style }) {
  return (
    <button
      type="button"
      className="sr-op"
      style={toneStyle(action.tone, style)}
      onClick={() => onSelect(action)}
    >
      <span className="sr-op__icon">
        <Icon name={action.icon} size={20} />
      </span>
      <span className="sr-op__body">
        <span className="sr-op__title">{action.title}</span>
        <span className="sr-op__sub">{action.subtitle}</span>
      </span>
      <Icon name="chevronRight" size={17} className="sr-op__chev" />
    </button>
  );
}

/** Side-drawer entry. */
export function SideMenuItem({ item, isActive, badge, onSelect, children }) {
  return (
    <>
      <button
        type="button"
        className={[
          'sr-menu__item',
          isActive ? 'sr-menu__item--active' : '',
          item.danger ? 'sr-menu__item--danger' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onSelect(item)}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="sr-menu__icon">
          <Icon name={item.icon} size={16} />
        </span>
        <span className="sr-menu__text">
          <span className="sr-menu__label">{item.label}</span>
          <span className="sr-menu__desc">{item.description}</span>
        </span>
        {badge ? <span className="sr-menu__badge">{badge}</span> : null}
      </button>
      {children}
    </>
  );
}

/** Bottom navigation entry. */
export function BottomNavItem({ item, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={`sr-navitem ${isActive ? 'sr-navitem--active' : ''}`}
      onClick={() => onSelect(item)}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon name={item.icon} size={20} strokeWidth={isActive ? 2 : 1.7} />
      <span>{item.label}</span>
      <span className="sr-navitem__pip" />
    </button>
  );
}

/** Skeleton placeholder shown while the dashboard payload loads. */
export function LoadingState() {
  return (
    <>
      <section className="sr-section" aria-busy="true" aria-label="Loading dashboard">
        <div className="sr-skel" style={{ width: 120, height: 13, marginBottom: 11 }} />
        <div className="sr-summary">
          {[0, 1, 2].map((i) => (
            <div className="sr-skel-card" key={i} style={i === 0 ? { gridColumn: '1 / -1' } : undefined}>
              <div className="sr-skel" style={{ width: 34, height: 34, borderRadius: 11 }} />
              <div className="sr-skel" style={{ width: '46%', height: 24, marginTop: 12 }} />
              <div className="sr-skel" style={{ width: '72%', height: 11, marginTop: 9 }} />
            </div>
          ))}
        </div>
      </section>

      <section className="sr-section">
        <div className="sr-skel" style={{ width: 148, height: 13, marginBottom: 11 }} />
        <div className="sr-attention">
          {[0, 1, 2].map((i) => (
            <div className="sr-skel-card sr-skel-row" key={i}>
              <div className="sr-skel" style={{ width: 32, height: 32, borderRadius: 10, flex: 'none' }} />
              <div style={{ flex: 1 }}>
                <div className="sr-skel" style={{ width: '80%', height: 12 }} />
                <div className="sr-skel" style={{ width: '58%', height: 10, marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/** Positive empty state (used when nothing needs attention). */
export function EmptyState({
  icon = 'check',
  title = 'No urgent actions right now.',
  text = 'Every request, sample and delivery is on track. New items will appear here automatically.',
}) {
  return (
    <div className="sr-empty">
      <span className="sr-empty__icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="sr-empty__title">{title}</div>
      <p className="sr-empty__text">{text}</p>
    </div>
  );
}

/** Error state with retry. */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="sr-error" role="alert">
      <span className="sr-attn__icon" style={toneStyle('red')}>
        <Icon name="alert" size={16} />
      </span>
      <div className="sr-error__body">
        <div className="sr-error__title">Could not load dashboard data</div>
        <p className="sr-error__text">{message}</p>
        <button type="button" className="sr-btn-retry" onClick={onRetry}>
          Try again
        </button>
      </div>
    </div>
  );
}

/* ===========================================================================
 * 3. Page component
 * ========================================================================= */

export default function AdminDashboard() {
  /* ---- Remote data ---- */
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ---- UI state ---- */
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState('dashboard');
  const [activeNavId, setActiveNavId] = useState('home');
  const [toast, setToast] = useState('');

  const toastTimer = useRef(null);

  /* ---- Toast helper ---- */
  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---- Load dashboard payload ---- */
  const loadDashboard = useCallback(
    async ({ isRefresh = false } = {}) => {
      if (isRefresh) setIsRefreshing(true);
      else setStatus('loading');
      setError('');

      try {
        const payload = await dashboardApi.fetchDashboard();
        setData(payload);
        setLastUpdated(payload.updatedAt || new Date().toISOString());
        setStatus('ready');
        if (isRefresh) showToast('Dashboard updated with the latest operations data.');
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
        setStatus('error');
      } finally {
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ---- Lock body scroll while an overlay is open ---- */
  const hasOverlay = isMenuOpen || isNotifOpen || isLogoutOpen;

  useEffect(() => {
    if (!hasOverlay) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [hasOverlay]);

  /* ---- Close overlays with Escape ---- */
  useEffect(() => {
    if (!hasOverlay) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setNotifOpen(false);
      setLogoutOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasOverlay]);

  /* ---- Derived values ---- */
  const admin = data?.admin;
  const summary = useMemo(() => data?.summary ?? [], [data]);
  const notifications = data?.notifications ?? { unreadCount: 0, items: [] };

  const attention = useMemo(() => {
    const items = data?.attention ?? [];
    return [...items].sort(
      (a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9)
    );
  }, [data]);

  const urgentCount = useMemo(
    () => attention.filter((item) => item.severity === 'red').length,
    [attention]
  );

  /**
   * Single navigation funnel.
   * Replace the body with react-router: `const go = useNavigate(); go(route);`
   */
  const navigate = useCallback(
    (route, label) => {
      showToast(`Opening ${label || route}`);
      // navigate(route)  <-- wire your router here
      // eslint-disable-next-line no-console
      console.log('[StoneRate] navigate ->', route);
    },
    [showToast]
  );

  /* ---- Handlers ---- */
  const handleSummarySelect = useCallback(
    (stat) => {
      const nav = stat.id === 'samples-today' ? 'samples' : 'orders';
      setActiveNavId(nav);
      navigate(stat.route, stat.label);
    },
    [navigate]
  );

  const handleAttentionAction = useCallback(
    (item) => {
      navigate(item.route, item.title);
    },
    [navigate]
  );

  const handleOperationSelect = useCallback(
    (action) => {
      setActiveNavId(action.id === 'samples' ? 'samples' : 'orders');
      navigate(action.route, action.title);
    },
    [navigate]
  );

  const handleMenuSelect = useCallback(
    (item) => {
      if (item.id === 'logout') {
        setMenuOpen(false);
        setLogoutOpen(true);
        return;
      }
      setActiveMenuId(item.id);
      setMenuOpen(false);
      if (item.id === 'dashboard') {
        setActiveNavId('home');
        return;
      }
      navigate(item.route, item.label);
    },
    [navigate]
  );

  const handleNavSelect = useCallback(
    (item) => {
      setActiveNavId(item.id);
      if (item.id === 'home') {
        setActiveMenuId('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      navigate(item.route, item.label);
    },
    [navigate]
  );

  const handleLogoutConfirm = useCallback(() => {
    setLogoutOpen(false);
    showToast('You have been signed out of StoneRate Admin.');
    // Call your auth service here, then redirect to /login.
  }, [showToast]);

  /* ---- Render ---- */
  return (
    <div className="sr-app">
      {/* ================= HEADER ================= */}
      <header className="sr-header">
        <div className="sr-header__inner">
          <div className="sr-header__row">
            <button
              type="button"
              className="sr-iconbtn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
            >
              <Icon name="menu" size={19} />
            </button>

            <div className="sr-brand">
              <span className="sr-brand__mark">
                <Icon name="samples" size={18} strokeWidth={1.9} />
              </span>
              <span className="sr-brand__text">
                <span className="sr-brand__name">StoneRate</span>
                <span className="sr-brand__role">Admin Console</span>
              </span>
            </div>

            <NotificationButton
              unreadCount={notifications.unreadCount}
              onClick={() => setNotifOpen(true)}
            />

            <button
              type="button"
              className={`sr-iconbtn ${isRefreshing ? 'sr-iconbtn--spin' : ''}`}
              onClick={() => loadDashboard({ isRefresh: true })}
              disabled={isRefreshing}
              aria-label="Refresh dashboard"
            >
              <Icon name="refresh" size={18} />
            </button>
          </div>

          <div className="sr-greeting">
            <h1 className="sr-greeting__title">
              Hi, <span>{admin?.firstName || 'Admin'}</span>
            </h1>
            <p className="sr-greeting__sub">
              Here&rsquo;s what&rsquo;s happening with StoneRate operations today.
            </p>
            <span className="sr-updated">
              <span className="sr-updated__pip" />
              {isRefreshing
                ? 'Syncing latest data…'
                : `Last updated ${formatClock(lastUpdated)}`}
            </span>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="sr-shell">
        {status === 'loading' && <LoadingState />}

        {status === 'error' && (
          <section className="sr-section">
            <ErrorState message={error} onRetry={() => loadDashboard()} />
          </section>
        )}

        {status === 'ready' && (
          <>
            {/* ---- Dashboard summary ---- */}
            <section className="sr-section">
              <div className="sr-section__head">
                <h2 className="sr-section__title">Today at a glance</h2>
                <span className="sr-section__meta">Tap a card to open</span>
              </div>

              <div className="sr-summary">
                {summary.map((stat, index) => (
                  <SummaryCard
                    key={stat.id}
                    stat={stat}
                    onSelect={handleSummarySelect}
                    style={{ animationDelay: `${index * 60}ms` }}
                  />
                ))}
              </div>
            </section>

            {/* ---- Attention required ---- */}
            <section className="sr-section">
              <div className="sr-section__head">
                <h2 className="sr-section__title">
                  Attention Required
                  {urgentCount > 0 && (
                    <span className="sr-count-chip">{urgentCount} urgent</span>
                  )}
                </h2>
                <span className="sr-section__meta">
                  {attention.length > 0 ? `${attention.length} items` : 'All clear'}
                </span>
              </div>

              {attention.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="sr-attention">
                  {attention.map((item, index) => (
                    <AttentionItem
                      key={item.id}
                      item={item}
                      onAction={handleAttentionAction}
                      style={{ animationDelay: `${index * 45}ms` }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ---- Manage operations ---- */}
            <section className="sr-section">
              <div className="sr-section__head">
                <h2 className="sr-section__title">Manage Operations</h2>
                <span className="sr-section__meta">Daily workflows</span>
              </div>

              <div className="sr-ops">
                {OPERATION_ACTIONS.map((action, index) => (
                  <OperationButton
                    key={action.id}
                    action={action}
                    onSelect={handleOperationSelect}
                    style={{ animationDelay: `${index * 60}ms` }}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ================= SIDE DRAWER ================= */}
      {isMenuOpen && (
        <>
          <button
            type="button"
            className="sr-overlay"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="sr-drawer" aria-label="Admin navigation">
            <div className="sr-drawer__head">
              <span className="sr-brand__mark">
                <Icon name="samples" size={18} strokeWidth={1.9} />
              </span>
              <div className="sr-drawer__id">
                <div className="sr-drawer__name">{admin?.fullName || 'StoneRate Admin'}</div>
                <div className="sr-drawer__role">
                  {admin?.role || 'Operations Administrator'}
                </div>
              </div>
              <button
                type="button"
                className="sr-iconbtn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="sr-drawer__body">
              <div className="sr-menu">
                {MENU_ITEMS.map((item) => (
                  <SideMenuItem
                    key={item.id}
                    item={item}
                    isActive={activeMenuId === item.id}
                    badge={
                      item.id === 'notifications' && notifications.unreadCount > 0
                        ? notifications.unreadCount
                        : null
                    }
                    onSelect={handleMenuSelect}
                  >
                    {item.children && activeMenuId === item.id && (
                      <div className="sr-menu__sub">
                        {item.children.map((child) => (
                          <button
                            type="button"
                            key={child.id}
                            className="sr-chip"
                            onClick={() => {
                              setMenuOpen(false);
                              navigate(child.route, child.label);
                            }}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </SideMenuItem>
                ))}
              </div>
            </div>

            <div className="sr-drawer__foot">
              Registration filters available inside Users &amp; Partners:{' '}
              {USER_REGISTRATION_FILTERS.map((f) => f.label).join(' · ')}
            </div>
          </nav>
        </>
      )}

      {/* ================= NOTIFICATIONS SHEET ================= */}
      {isNotifOpen && (
        <>
          <button
            type="button"
            className="sr-overlay"
            aria-label="Close notifications"
            onClick={() => setNotifOpen(false)}
          />
          <section className="sr-sheet" aria-label="Notifications">
            <span className="sr-sheet__grip" />
            <div className="sr-sheet__head">
              <span className="sr-sheet__title">
                Notifications
                {notifications.unreadCount > 0 && (
                  <span className="sr-count-chip">{notifications.unreadCount} new</span>
                )}
              </span>
              <button
                type="button"
                className="sr-iconbtn"
                onClick={() => setNotifOpen(false)}
                aria-label="Close notifications"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="sr-sheet__body">
              {notifications.items.length === 0 ? (
                <EmptyState
                  icon="check"
                  title="You are all caught up."
                  text="New system and operational alerts will appear here."
                />
              ) : (
                notifications.items.map((item) => (
                  <article
                    key={item.id}
                    className={`sr-notif ${!item.read ? 'sr-notif--unread' : ''}`}
                  >
                    {!item.read && <span className="sr-notif__pip" />}
                    <div>
                      <div className="sr-notif__title">{item.title}</div>
                      <div className="sr-notif__time">{item.time}</div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* ================= LOGOUT CONFIRMATION ================= */}
      {isLogoutOpen && (
        <div className="sr-modal" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="sr-modal__box">
            <span className="sr-modal__icon">
              <Icon name="logout" size={20} />
            </span>
            <div className="sr-modal__title">Sign out of StoneRate Admin?</div>
            <p className="sr-modal__text">
              You will need to sign in again to manage samples, rate requests and
              active orders.
            </p>
            <div className="sr-modal__actions">
              <button
                type="button"
                className="sr-btn sr-btn--ghost"
                onClick={() => setLogoutOpen(false)}
              >
                Stay signed in
              </button>
              <button
                type="button"
                className="sr-btn sr-btn--danger"
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {toast && (
        <div className="sr-toast" role="status">
          <span className="sr-toast__pip" />
          {toast}
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      <nav className="sr-bottomnav" aria-label="Primary">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <BottomNavItem
            key={item.id}
            item={item}
            isActive={activeNavId === item.id}
            onSelect={handleNavSelect}
          />
        ))}
      </nav>
    </div>
  );
}
