"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useToast = exports.ToastManager = exports.Toast = void 0;
const react_1 = __importStar(require("react"));
const react_dom_1 = require("react-dom");
const soundManager_1 = require("../../../utils/soundManager");
const toastColors = {
    success: 'bg-green-800 border-green-600',
    error: 'bg-red-800 border-red-600',
    warning: 'bg-yellow-800 border-yellow-600',
    info: 'bg-gray-800 border-gray-600'
};
const toastIcons = {
    success: (<svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
    </svg>),
    error: (<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>),
    warning: (<svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>),
    info: (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>)
};
const priorityConfig = {
    low: {
        duration: 2000,
        zIndexOffset: 0,
        order: 0
    },
    normal: {
        duration: 3000,
        zIndexOffset: 10,
        order: 1
    },
    high: {
        duration: 5000,
        zIndexOffset: 20,
        order: 2
    },
    critical: {
        duration: 0, // Persistent by default
        zIndexOffset: 30,
        order: 3
    }
};
const TOAST_SPACING = 16; // Spacing between toasts in pixels
const Toast = ({ message, type = 'info', priority = 'normal', duration: customDuration, onClose, index = 0, persistent = false }) => {
    const [isExiting, setIsExiting] = (0, react_1.useState)(false);
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    // Use priority-based duration unless custom duration is provided
    const defaultDuration = priorityConfig[priority].duration;
    const duration = customDuration ?? defaultDuration;
    const [remainingTime, setRemainingTime] = (0, react_1.useState)(duration);
    // Play sound when the toast appears
    (0, react_1.useEffect)(() => {
        const playNotificationSound = async () => {
            // Use critical sound for critical priority, otherwise use the type-based sound
            const soundType = priority === 'critical' ? 'critical' : type;
            await soundManager_1.soundManager.playSound(soundType);
        };
        playNotificationSound();
    }, [type, priority]);
    (0, react_1.useEffect)(() => {
        // Don't set up timers for persistent notifications
        if (persistent || priority === 'critical')
            return;
        let exitTimer;
        let closeTimer;
        if (!isPaused && remainingTime > 0) {
            exitTimer = setTimeout(() => {
                setIsExiting(true);
                setRemainingTime(300); // Time for exit animation
            }, remainingTime - 300);
            closeTimer = setTimeout(() => {
                onClose();
            }, remainingTime);
        }
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(closeTimer);
        };
    }, [remainingTime, onClose, isPaused, persistent, priority]);
    const handleMouseEnter = () => {
        setIsPaused(true);
    };
    const handleMouseLeave = () => {
        setIsPaused(false);
    };
    const handleClick = () => {
        // Don't allow click-to-dismiss for critical notifications
        if (priority === 'critical')
            return;
        setIsExiting(true);
        setTimeout(onClose, 300);
    };
    const bottomPosition = `${24 + (index * (48 + TOAST_SPACING))}px`;
    const zIndex = 9999 - index + priorityConfig[priority].zIndexOffset;
    return (0, react_dom_1.createPortal)(<div role="alert" aria-live={priority === 'critical' ? 'assertive' : 'polite'} style={{ bottom: bottomPosition, zIndex }} className={`
        fixed left-1/2 transform -translate-x-1/2
        px-4 py-2 rounded-lg shadow-lg border
        flex items-center gap-2
        transition-all duration-300
        ${priority !== 'critical' ? 'cursor-pointer hover:brightness-110' : ''}
        ${toastColors[type]}
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {toastIcons[type]}
      <span className="text-white">{message}</span>
      {(priority !== 'critical' && !persistent) && (<button className="ml-2 text-white/80 hover:text-white focus:outline-none" onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }} aria-label="Close notification">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>)}
    </div>, document.body);
};
exports.Toast = Toast;
const ToastManager = ({ messages, onMessageComplete, maxVisible = 3 // Maximum number of visible toasts
 }) => {
    // Sort messages by priority and take the first maxVisible
    const sortedMessages = [...messages]
        .sort((a, b) => {
        const aOrder = priorityConfig[a.priority || 'normal'].order;
        const bOrder = priorityConfig[b.priority || 'normal'].order;
        if (bOrder !== aOrder) {
            return bOrder - aOrder; // Sort by priority first
        }
        return b.id - a.id; // Then by id (most recent first)
    })
        .slice(0, maxVisible);
    return (<>
      {sortedMessages.map((message, index) => (<exports.Toast key={message.id} message={message.message} type={message.type} priority={message.priority} persistent={message.persistent} index={index} onClose={() => onMessageComplete(message.id)}/>))}
    </>);
};
exports.ToastManager = ToastManager;
// Hook to manage toast messages
const useToast = () => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [nextId, setNextId] = (0, react_1.useState)(0);
    const showToast = (message, type = 'info', priority = 'normal', persistent = false) => {
        const id = nextId;
        setMessages(prev => [...prev, { id, message, type, priority, persistent }]);
        setNextId(prev => prev + 1);
    };
    const removeMessage = (id) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    };
    return {
        messages,
        showToast,
        removeMessage
    };
};
exports.useToast = useToast;
