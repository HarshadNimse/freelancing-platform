class ChatApp {
    constructor() {
        this.socket = null;
        this.messageContainer = document.getElementById('messageContainer');
        this.messageForm = document.getElementById('messageForm');
        this.messageInput = document.getElementById('messageInput');
        this.typingStatus = document.getElementById('typingStatus');
        this.chatPartnerName = document.getElementById('chatPartnerName');
        this.messageTemplate = document.getElementById('messageTemplate');
        this.typingTimeout = null;
        
        this.init();
    }

    init() {
        // Get chat partner info from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.chatPartnerId = urlParams.get('userId');
        this.chatPartnerName.textContent = urlParams.get('name') || 'Chat';

        // Initialize Socket.IO connection
        this.initializeSocket();
        
        // Load chat history
        this.loadChatHistory();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    initializeSocket() {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        this.socket = io('http://localhost:5000', {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
        });

        this.socket.on('new message', (message) => {
            this.displayMessage(message);
            this.scrollToBottom();
            
            // If message is from chat partner, mark as read
            if (message.sender === this.chatPartnerId) {
                this.markMessagesAsRead();
            }
        });

        this.socket.on('user typing', ({ userId }) => {
            if (userId === this.chatPartnerId) {
                this.showTypingIndicator();
            }
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            alert('Error: ' + error.message);
        });
    }

    setupEventListeners() {
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        this.messageInput.addEventListener('input', () => {
            this.handleTyping();
        });
    }

    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chat/history/${this.chatPartnerId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load chat history');
            
            const messages = await response.json();
            messages.forEach(message => this.displayMessage(message));
            this.scrollToBottom();
            
            // Mark messages as read
            this.markMessagesAsRead();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    async markMessagesAsRead() {
        try {
            await fetch(`/api/chat/read/${this.chatPartnerId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    }

    sendMessage() {
        const content = this.messageInput.value.trim();
        if (!content) return;

        this.socket.emit('private message', {
            receiverId: this.chatPartnerId,
            content
        });

        this.messageInput.value = '';
    }

    displayMessage(message) {
        const clone = this.messageTemplate.content.cloneNode(true);
        const messageDiv = clone.querySelector('.message');
        const contentP = clone.querySelector('p');
        const timestamp = clone.querySelector('span');

        // Set message content
        contentP.textContent = message.content;
        timestamp.textContent = new Date(message.createdAt).toLocaleTimeString();

        // Style based on sender
        const isOwnMessage = message.sender === this.socket.userId;
        messageDiv.classList.add(isOwnMessage ? 'sent' : 'received');

        this.messageContainer.appendChild(clone);
    }

    handleTyping() {
        clearTimeout(this.typingTimeout);
        
        this.socket.emit('typing', {
            receiverId: this.chatPartnerId
        });

        this.typingTimeout = setTimeout(() => {
            this.typingStatus.textContent = '';
        }, 3000);
    }

    showTypingIndicator() {
        this.typingStatus.textContent = 'Typing...';
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.typingStatus.textContent = '';
        }, 3000);
    }

    scrollToBottom() {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
}); 