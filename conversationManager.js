class ConversationManager {
    constructor() {
        this.conversations = [];
    }

    createNewConversation() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newConversation = {
            id: Date.now(),
            name: timestamp,
            content: ''
        };
        this.conversations.push(newConversation);
        return newConversation;
    }

    renameConversation(id, newName) {
        const conversation = this.conversations.find(c => c.id === id);
        if (conversation) {
            conversation.name = newName;
            return true;
        }
        return false;
    }

    deleteConversation(id) {
        const index = this.conversations.findIndex(c => c.id === id);
        if (index !== -1) {
            this.conversations.splice(index, 1);
            return true;
        }
        return false;
    }

    async exportToPDF(id) {
        const conversation = this.conversations.find(c => c.id === id);
        if (!conversation) return false;
        
        const { PDFDocument, rgb } = require('pdf-lib');
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([550, 750]);
        const { height } = page.getSize();
        
        page.drawText(conversation.name, {
          x: 50,
          y: height - 50,
          size: 24,
          color: rgb(0, 0, 0)
        });
        
        page.drawText(conversation.content, {
          x: 50,
          y: height - 100,
          size: 12,
          color: rgb(0, 0, 0)
        });
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    }
}

module.exports = ConversationManager;