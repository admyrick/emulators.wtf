// Simple fallback icons to replace lucide-react
export const Icons = {
  // Navigation & UI
  Menu: () => <span>☰</span>,
  Search: () => <span>🔍</span>,
  X: () => <span>×</span>,
  ChevronDown: () => <span>▼</span>,
  ChevronUp: () => <span>▲</span>,
  ChevronLeft: () => <span>◀</span>,
  ChevronRight: () => <span>▶</span>,
  ArrowLeft: () => <span>←</span>,
  ArrowRight: () => <span>→</span>,

  // Status & Feedback
  Check: () => <span>✓</span>,
  CheckCircle: () => <span>✅</span>,
  AlertCircle: () => <span>⚠️</span>,
  AlertTriangle: () => <span>⚠️</span>,
  XCircle: () => <span>❌</span>,
  Info: () => <span>ℹ️</span>,

  // Loading & Actions
  Loader2: () => <span className="animate-spin">⟳</span>,
  RefreshCw: () => <span>🔄</span>,
  Plus: () => <span>+</span>,
  Edit: () => <span>✏️</span>,
  Trash2: () => <span>🗑️</span>,
  Save: () => <span>💾</span>,
  Download: () => <span>⬇️</span>,

  // Gaming & Tech
  Gamepad2: () => <span>🎮</span>,
  Joystick: () => <span>🕹️</span>,
  Monitor: () => <span>🖥️</span>,
  Smartphone: () => <span>📱</span>,
  Cpu: () => <span>🔧</span>,
  HardDrive: () => <span>💾</span>,
  Database: () => <span>🗄️</span>,

  // Social & External
  Github: () => <span>🐙</span>,
  ExternalLink: () => <span>🔗</span>,
  LinkIcon: () => <span>🔗</span>,
  Globe: () => <span>🌐</span>,

  // Theme & Settings
  Sun: () => <span>☀️</span>,
  Moon: () => <span>🌙</span>,
  Settings: () => <span>⚙️</span>,
  Palette: () => <span>🎨</span>,

  // User & Social
  User: () => <span>👤</span>,
  Users: () => <span>👥</span>,
  Heart: () => <span>❤️</span>,
  Star: () => <span>⭐</span>,

  // Misc
  Calendar: () => <span>📅</span>,
  Clock: () => <span>🕐</span>,
  Tag: () => <span>🏷️</span>,
  Filter: () => <span>🔽</span>,
  Eye: () => <span>👁️</span>,
  Home: () => <span>🏠</span>,
  Package: () => <span>📦</span>,
  FileText: () => <span>📄</span>,
  Code: () => <span>💻</span>,
  Shield: () => <span>🛡️</span>,
  Zap: () => <span>⚡</span>,
  Battery: () => <span>🔋</span>,
  Wifi: () => <span>📶</span>,
  Bluetooth: () => <span>📶</span>,
  Weight: () => <span>⚖️</span>,
  Building: () => <span>🏢</span>,
  DollarSign: () => <span>$</span>,
  TrendingUp: () => <span>📈</span>,
  LogOut: () => <span>🚪</span>,

  // Layout & Structure
  PanelLeft: () => <span>📋</span>,
  GripVertical: () => <span>⋮</span>,
  MoreHorizontal: () => <span>⋯</span>,
  SortAsc: () => <span>↑</span>,
  GitCompare: () => <span>⚖️</span>,

  // Simple shapes
  Circle: () => <span>○</span>,
  Dot: () => <span>•</span>,

  // Fallback for any missing icons
  Wrench: () => <span>🔧</span>,
}

// Type for icon names
export type IconName = keyof typeof Icons
